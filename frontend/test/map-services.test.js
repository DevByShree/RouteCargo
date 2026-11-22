import test from "node:test";
import assert from "node:assert/strict";
import { calculateRoadRoutes, formatRouteDuration, searchPlaces } from "../src/API/mapServices.js";

test("geocoding maps provider results to labelled coordinates and caches them", async () => {
  const previousFetch = globalThis.fetch;
  let calls = 0;
  let requestedUrl = "";
  globalThis.fetch = async url => {
    calls += 1;
    requestedUrl = String(url);
    return new Response(JSON.stringify({ features: [{
      geometry: { coordinates: [73.8567, 18.5204] },
      properties: { name: "Pune", state: "Maharashtra", country: "India" },
    }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const first = await searchPlaces("  Pune, Maharashtra ", { baseUrl: "https://geo.test" });
    const second = await searchPlaces("pune, maharashtra", { baseUrl: "https://geo.test" });
    assert.deepEqual(first, [{ label: "Pune, Maharashtra, India", latitude: 18.5204, longitude: 73.8567, city: "", state: "Maharashtra", country: "India" }]);
    assert.deepEqual(second, first);
    assert.equal(calls, 1);
    assert.equal(new URL(requestedUrl).searchParams.get("q"), "Pune, Maharashtra");
  } finally { globalThis.fetch = previousFetch; }
});

test("routing uses provider geometry and real distance and duration values", async () => {
  const previousFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async url => {
    requestedUrl = String(url);
    return new Response(JSON.stringify({ code: "Ok", routes: [
      { distance: 148500, duration: 10800, geometry: { coordinates: [[73.8567, 18.5204], [72.8777, 19.076]] } },
      { distance: 155000, duration: 11700, geometry: { coordinates: [[73.8567, 18.5204], [72.8777, 19.076]] } },
    ] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const routes = await calculateRoadRoutes([
      { latitude: 18.5204, longitude: 73.8567 },
      { latitude: 19.076, longitude: 72.8777 },
    ], { baseUrl: "https://router.test" });
    assert.equal(routes.length, 2);
    assert.equal(routes[0].distanceKm, 148.5);
    assert.equal(routes[0].durationSeconds, 10800);
    assert.deepEqual(routes[0].positions, [[18.5204, 73.8567], [19.076, 72.8777]]);
    assert.match(requestedUrl, /73\.8567,18\.5204;72\.8777,19\.076/);
    assert.match(requestedUrl, /alternatives=true/);
    assert.equal(formatRouteDuration(10800), "3 hrs");
  } finally { globalThis.fetch = previousFetch; }
});

test("invalid routes and provider failures return usable errors", async () => {
  await assert.rejects(() => calculateRoadRoutes([{ latitude: 10, longitude: 20 }], { baseUrl: "https://router.test" }), /Choose valid pickup and destination/);
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ code: "NoRoute", routes: [] }), { status: 200 });
  try {
    await assert.rejects(() => calculateRoadRoutes([
      { latitude: 10, longitude: 20 }, { latitude: 11, longitude: 21 },
    ], { baseUrl: "https://router.test" }), /No driving route was found/);
  } finally { globalThis.fetch = previousFetch; }
});
