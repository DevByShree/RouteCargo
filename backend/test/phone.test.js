const { test } = require("node:test");
const assert = require("node:assert/strict");
const { normalizePhone, phoneLookupValues } = require("../src/utils/phone");

test("normalizes Indian national, trunk-prefix, international, and spaced phone input to E.164", () => {
  assert.equal(normalizePhone("9876543210"), "+919876543210");
  assert.equal(normalizePhone("09876543210"), "+919876543210");
  assert.equal(normalizePhone("+91 98765 43210"), "+919876543210");
  assert.equal(normalizePhone("0091-98765-43210"), "+919876543210");
  assert.equal(normalizePhone("+1 (415) 555-2671"), "+14155552671");
  assert.equal(normalizePhone("123"), "");
});

test("lookup variants find common legacy phone formats", () => {
  assert.deepEqual(phoneLookupValues("+919876543210"), [
    "+919876543210",
    "919876543210",
    "9876543210",
    "09876543210",
    "+91 9876543210",
  ]);
});
