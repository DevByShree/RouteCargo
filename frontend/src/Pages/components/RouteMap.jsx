import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import { LocateFixed, MapPin, Route as RouteIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { calculateRoadRoutes, formatRouteDuration, geocodePlace } from "../../API/mapServices";

const env = import.meta.env || {};
const tileUrl = env.VITE_OSM_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const markerIcon = (color, label) => L.divIcon({
  className: "routecargo-map-marker",
  html: `<span style="display:block;width:22px;height:22px;border:3px solid white;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 1px 5px #33415599"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  tooltipAnchor: [0, -16],
  title: label,
});
const pickupIcon = markerIcon("#16a34a", "Pickup location");
const destinationIcon = markerIcon("#dc2626", "Destination");
const stopIcon = markerIcon("#f59e0b", "Route stop");
const truckIcon = L.divIcon({
  className: "routecargo-live-truck-marker",
  html: '<span style="display:flex;width:34px;height:34px;align-items:center;justify-content:center;border:2px solid white;border-radius:50%;background:#1d4ed8;color:white;box-shadow:0 1px 6px #0f172a88;font-size:17px">🚚</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  tooltipAnchor: [0, -17],
});
const NO_STOPS = [];

function FitRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(L.latLngBounds(positions), { padding: [36, 36], maxZoom: 12 });
    else if (positions.length === 1) map.setView(positions[0], 11);
  }, [map, positions]);
  return null;
}

function MapButtons({ center }) {
  const map = useMap();
  const buttonRef = useRef(null);
  useEffect(() => {
    if (buttonRef.current) L.DomEvent.disableClickPropagation(buttonRef.current);
  }, []);
  return <button ref={buttonRef} type="button" onClick={() => map.setView(center, Math.max(map.getZoom(), 10))}
    aria-label="Recenter map on pickup" title="Recenter map"
    className="absolute bottom-3 right-3 z-[1000] rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow hover:bg-slate-50">
    <LocateFixed size={18}/>
  </button>;
}

function mapPoint(place) {
  return { latitude: place.latitude, longitude: place.longitude };
}

export default function RouteMap({ from, to, fromPlace, toPlace, intermediateStops = NO_STOPS, onRouteCalculated, livePosition = null, actionLabel = "Open directions", className = "" }) {
  const fromPlaceLabel = fromPlace?.label;
  const fromLatitude = fromPlace?.latitude;
  const fromLongitude = fromPlace?.longitude;
  const toPlaceLabel = toPlace?.label;
  const toLatitude = toPlace?.latitude;
  const toLongitude = toPlace?.longitude;
  const stopsKey = JSON.stringify(intermediateStops.map(stop => typeof stop === "string" ? stop : stop.label || ""));
  const requestKey = JSON.stringify([from, to, fromPlaceLabel, fromLatitude, fromLongitude, toPlaceLabel, toLatitude, toLongitude, stopsKey]);
  const [routeState, setRouteState] = useState({ key: "", origin: null, destination: null, stops: [], routes: [], selectedRoute: 0, loading: false, error: "" });
  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => { onRouteCalculatedRef.current = onRouteCalculated; }, [onRouteCalculated]);
  const current = routeState.key === requestKey ? routeState : null;
  const origin = current?.origin || null;
  const destination = current?.destination || null;
  const stops = current?.stops || NO_STOPS;
  const routes = current?.routes || NO_STOPS;
  const selectedRoute = current?.selectedRoute || 0;
  const loading = current?.loading ?? Boolean(String(from || "").trim() && String(to || "").trim());
  const error = current?.error || "";

  useEffect(() => {
    if (!String(from || "").trim() || !String(to || "").trim()) return undefined;
    const controller = new AbortController();
    let active = true;
    const resolve = (text, selectedLabel, latitude, longitude) => selectedLabel === text
      && Number.isFinite(latitude) && Number.isFinite(longitude)
      ? Promise.resolve({ label: selectedLabel, latitude, longitude })
      : geocodePlace(text, { signal: controller.signal });

    const timer = window.setTimeout(async () => {
      if (active) setRouteState({ key: requestKey, origin: null, destination: null, stops: [], routes: [], selectedRoute: 0, loading: true, error: "" });
      try {
        const [pickup, dropoff, ...via] = await Promise.all([
          resolve(from, fromPlaceLabel, fromLatitude, fromLongitude),
          resolve(to, toPlaceLabel, toLatitude, toLongitude),
          ...JSON.parse(stopsKey).map(stop => geocodePlace(stop, { signal: controller.signal })),
        ]);
        if (!active) return;
        try {
          const result = await calculateRoadRoutes([pickup, ...via, dropoff].map(mapPoint), { signal: controller.signal });
          if (!active) return;
          setRouteState({ key: requestKey, origin: pickup, destination: dropoff, stops: via, routes: result, selectedRoute: 0, loading: false, error: "" });
          onRouteCalculatedRef.current?.(result[0] || null);
        } catch (routeError) {
          if (!active) return;
          setRouteState({ key: requestKey, origin: pickup, destination: dropoff, stops: via, routes: [], selectedRoute: 0, loading: false, error: routeError.message || "Could not calculate a driving route." });
          onRouteCalculatedRef.current?.(null);
        }
      } catch (geocodeError) {
        if (!active || geocodeError.name === "AbortError") return;
        setRouteState({ key: requestKey, origin: null, destination: null, stops: [], routes: [], selectedRoute: 0, loading: false, error: geocodeError.message || "Could not resolve one of these locations." });
        onRouteCalculatedRef.current?.(null);
      }
    }, 650);
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [from, to, fromPlaceLabel, fromLatitude, fromLongitude, toPlaceLabel, toLatitude, toLongitude, stopsKey, requestKey]);

  const route = routes[selectedRoute] || null;
  const markerPositions = useMemo(() => [origin, ...stops, destination].filter(Boolean).map(place => [place.latitude, place.longitude]), [origin, stops, destination]);
  const fitPositions = route?.positions?.length ? route.positions : markerPositions;
  const center = origin ? [origin.latitude, origin.longitude] : null;
  const mapsUrl = origin && destination
    ? `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
    : null;

  const chooseRoute = index => {
    setRouteState(state => state.key === requestKey ? { ...state, selectedRoute: index } : state);
    if (routes[index]) onRouteCalculatedRef.current?.(routes[index]);
  };

  return <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`} aria-label="Planned road route">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
      <div><h3 className="flex items-center gap-2 font-semibold text-slate-900"><RouteIcon size={17} className="text-blue-700"/>Planned road route</h3><p className="mt-1 text-xs text-slate-500">Calculated using mapped roads. Travel time is an estimate.</p></div>
      {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">{actionLabel}</a>}
    </div>
    {error && <p role="status" className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">{error}</p>}
    {loading && <p role="status" className="border-b border-slate-100 px-4 py-2.5 text-sm text-slate-500">Resolving locations and calculating route…</p>}
    {origin && destination ? <>
      <div className="relative">
        <MapContainer center={center} zoom={6} scrollWheelZoom={false} zoomControl={false} className="h-72 w-full sm:h-80" aria-label="OpenStreetMap route map">
          <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'/>
          <ZoomControl position="topright"/>
          <MapButtons center={center}/>
          <FitRoute positions={fitPositions}/>
          {route && <Polyline positions={route.positions} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.85 }}/>}
          <Marker position={[origin.latitude, origin.longitude]} icon={pickupIcon}><Tooltip>{`Pickup: ${origin.label}`}</Tooltip></Marker>
          {stops.map((stop, index) => <Marker key={`${stop.latitude}-${stop.longitude}-${index}`} position={[stop.latitude, stop.longitude]} icon={stopIcon}><Tooltip>{`Stop ${index + 1}: ${stop.label}`}</Tooltip></Marker>)}
          <Marker position={[destination.latitude, destination.longitude]} icon={destinationIcon}><Tooltip>{`Destination: ${destination.label}`}</Tooltip></Marker>
          {Number.isFinite(livePosition?.latitude) && Number.isFinite(livePosition?.longitude) && <Marker position={[livePosition.latitude, livePosition.longitude]} icon={truckIcon} zIndexOffset={1000}><Tooltip>Driver live GPS location</Tooltip></Marker>}
        </MapContainer>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Road distance</p><p className="mt-1 font-semibold text-slate-900">{route ? `${route.distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Unavailable"}</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Estimated drive time</p><p className="mt-1 font-semibold text-slate-900">{route ? formatRouteDuration(route.durationSeconds) : "Unavailable"}</p></div>
      </div>
      {routes.length > 1 && <div className="flex flex-wrap gap-2 px-4 pb-4" aria-label="Alternative road routes">{routes.map((alternative, index) => <button key={alternative.id} type="button" aria-pressed={selectedRoute === index} onClick={() => chooseRoute(index)} className={`rounded-lg border px-3 py-2 text-left text-xs ${selectedRoute === index ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Route {index + 1} · {alternative.distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km · {formatRouteDuration(alternative.durationSeconds)}</button>)}</div>}
    </> : <div className="flex h-72 items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500 sm:h-80"><div><MapPin size={26} className="mx-auto mb-2 text-slate-400"/>{loading ? "Preparing the map…" : "Enter a pickup and destination to view the planned road route."}</div></div>}
    <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">Map data © OpenStreetMap contributors. {livePosition ? "Truck marker shows the latest GPS position sent by the driver's device." : "Live truck location appears when the driver shares GPS during the trip."}</p>
  </section>;
}
