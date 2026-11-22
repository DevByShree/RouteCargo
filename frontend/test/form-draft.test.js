import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { clearStoredDraft, formDraftKey, readDraft, writeDraft } from "../src/Authentication/formDraftStorage.js";

const data = new Map();
globalThis.localStorage = {
  getItem: key => data.has(key) ? data.get(key) : null,
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: key => data.delete(key),
};

afterEach(() => data.clear());

test("draft keys isolate users, roles, and forms", () => {
  const customer = formDraftKey({ role: "customer", userId: "user-1", formId: "shipment" });
  assert.notEqual(customer, formDraftKey({ role: "customer", userId: "user-2", formId: "shipment" }));
  assert.notEqual(customer, formDraftKey({ role: "driver", userId: "user-1", formId: "shipment" }));
  assert.notEqual(customer, formDraftKey({ role: "customer", userId: "user-1", formId: "parcel" }));
});

test("drafts restore validated data and fall back for invalid or old data", () => {
  const key = formDraftKey({ role: "driver", userId: "driver-1", formId: "availability" });
  const initial = { from: "", to: "" };
  const valid = value => value && typeof value.from === "string" && typeof value.to === "string";
  writeDraft(key, { from: "Pune", to: "Konkan" });
  assert.deepEqual(readDraft(key, initial, valid), { ...initial, from: "Pune", to: "Konkan" });
  writeDraft(key, { from: 42, to: "Konkan" });
  assert.deepEqual(readDraft(key, initial, valid), initial);
  data.set(key, JSON.stringify({ version: 0, data: { from: "Pune", to: "Konkan" } }));
  assert.deepEqual(readDraft(key, initial, valid), initial);
});

test("successful submission can clear only its own account-scoped draft", () => {
  const one = formDraftKey({ role: "customer", userId: "user-1", formId: "shipment" });
  const two = formDraftKey({ role: "customer", userId: "user-2", formId: "shipment" });
  writeDraft(one, { pickup: "Pune" });
  writeDraft(two, { pickup: "Mumbai" });
  clearStoredDraft(one);
  assert.deepEqual(readDraft(one, {}), {});
  assert.deepEqual(readDraft(two, {}), { pickup: "Mumbai" });
});
