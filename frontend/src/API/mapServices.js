const env = import.meta.env || {};
const GEOCODING_BASE = (env.VITE_GEOCODING_BASE_URL || (env.DEV ? "https://photon.komoot.io" : "")).replace(/\/$/, "");
const ROUTING_BASE = (env.VITE_ROUTING_BASE_URL || (env.DEV ? "https://router.project-osrm.org" : "")).replace(/\/$/, "");
const geocodeCache = new Map();
const routeCache = new Map();
const CACHE_LIMIT = 100;

function cacheValue(cache, key, value) {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
}

function locationLabel(properties = {}) {
  const locality = properties.city || properties.town || properties.village || properties.municipality || properties.county;
  return [...new Set([
    properties.name,
    properties.street,
    properties.housenumber,
    locality,
    properties.state,
    properties.country,
  ].filter(Boolean))].join(", ");
}

async function responseJson(response, serviceName) {
  if (!response.ok) throw new Error(`${serviceName} returned HTTP ${response.status}.`);
  return response.json();
}

export async function searchPlaces(query, { signal, limit = 5, baseUrl = GEOCODING_BASE } = {}) {
  const normalized = String(query || "").trim().replace(/\s+/g, " ");
  if (normalized.length < 3) return [];
  if (!baseUrl) throw new Error("Location search is not configured. Set VITE_GEOCODING_BASE_URL for this deployment.");
  const key = `${baseUrl}|${normalized.toLocaleLowerCase()}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  const params = new URLSearchParams({ q: normalized, limit: String(limit), lang: "en" });
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/?${params}`, { signal, headers: { Accept: "application/json" } });
  const data = await responseJson(response, "Location search");
  const places = (data.features || []).map(feature => {
    const [longitude, latitude] = feature.geometry?.coordinates || [];
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const properties = feature.properties || {};
    return {
      label: locationLabel(properties) || normalized,
      latitude,
      longitude,
      city: properties.city || properties.town || properties.village || "",
      state: properties.state || "",
      country: properties.country || "",
    };
  }).filter(Boolean);
  cacheValue(geocodeCache, key, places);
  return places;
}

export async function geocodePlace(query, options = {}) {
  const places = await searchPlaces(query, { ...options, limit: 5 });
  if (!places.length) throw new Error(`Could not find a mapped location for “${String(query || "").trim()}”.`);
  return places[0];
}

export async function calculateRoadRoutes(points, { signal, baseUrl = ROUTING_BASE } = {}) {
  const validPoints = (points || []).filter(point => Number.isFinite(point?.latitude) && Number.isFinite(point?.longitude));
  if (validPoints.length < 2) throw new Error("Choose valid pickup and destination locations before calculating a route.");
  if (!baseUrl) throw new Error("Road routing is not configured. Set VITE_ROUTING_BASE_URL for this deployment.");
  const key = `${baseUrl}|${validPoints.map(point => `${point.longitude.toFixed(5)},${point.latitude.toFixed(5)}`).join(";")}`;
  if (routeCache.has(key)) return routeCache.get(key);

  const coordinates = validPoints.map(point => `${point.longitude},${point.latitude}`).join(";");
  const params = new URLSearchParams({ overview: "full", geometries: "geojson", alternatives: "true", steps: "false" });
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/route/v1/driving/${coordinates}?${params}`, { signal, headers: { Accept: "application/json" } });
  const data = await responseJson(response, "Road routing");
  if (data.code !== "Ok" || !Array.isArray(data.routes) || !data.routes.length) {
    throw new Error("No driving route was found for these locations.");
  }
  const routes = data.routes.map((route, index) => ({
    id: String(index),
    distanceKm: route.distance / 1000,
    durationSeconds: route.duration,
    positions: (route.geometry?.coordinates || []).map(([longitude, latitude]) => [latitude, longitude]),
  })).filter(route => route.positions.length > 1);
  if (!routes.length) throw new Error("The routing service returned no usable road geometry.");
  cacheValue(routeCache, key, routes);
  return routes;
}

export function formatRouteDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "Not available";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} hr${hours === 1 ? "" : "s"}${minutes ? ` ${minutes} min` : ""}` : `${minutes} min`;
}
