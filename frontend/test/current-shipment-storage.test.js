import test from "node:test";
import assert from "node:assert/strict";
import { clearRememberedShipment, getRememberedShipment, rememberCurrentShipment } from "../src/API/currentShipmentStorage.js";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

test("active shipment state is persisted per user and can be restored after a new tab", () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = new MemoryStorage();
  try {
    rememberCurrentShipment("customer-a", { shipmentid: 41, pickup: "Mumbai", destination: "Pune", pickupDate: "2026-11-22" });
    rememberCurrentShipment("customer-b", { shipmentid: 52, pickup: "Delhi", destination: "Agra", pickupDate: "2026-11-23" });

    assert.deepEqual(getRememberedShipment("customer-a"), {
      shipmentId: 41, pickup: "Mumbai", destination: "Pune", pickupDate: "2026-11-22",
    });
    assert.equal(getRememberedShipment("customer-b").shipmentId, 52);
    assert.equal(getRememberedShipment("customer-c"), null);

    clearRememberedShipment("customer-a");
    assert.equal(getRememberedShipment("customer-a"), null);
    assert.equal(getRememberedShipment("customer-b").shipmentId, 52);
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});

test("invalid or missing active shipment data is ignored", () => {
  const previous = globalThis.localStorage;
  const storage = new MemoryStorage();
  globalThis.localStorage = storage;
  try {
    storage.setItem("routecargo:active-shipment:customer-a", "{broken");
    assert.equal(getRememberedShipment("customer-a"), null);
    rememberCurrentShipment("customer-a", { shipmentid: 0 });
    assert.equal(getRememberedShipment("customer-a"), null);
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});
