const test = require("node:test");
const assert = require("node:assert/strict");
const routeKey = require("../src/utils/routeKey");

test("route keys ignore casing and repeated whitespace", () => {
  assert.equal(routeKey("  Pune "), routeKey("pUnE"));
  assert.equal(routeKey("New   Delhi"), routeKey("new delhi"));
});

test("route keys ignore an optional state suffix", () => {
  assert.equal(routeKey("Pune, Maharashtra"), routeKey("Pune"));
});

test("Kokan and Konkan share the documented regional route key", () => {
  assert.equal(routeKey("Kokan"), routeKey("Konkan"));
});

test("different destinations remain distinct", () => {
  assert.notEqual(routeKey("Pune"), routeKey("Mumbai"));
  assert.notEqual(routeKey("Kokan"), routeKey("Goa"));
});
