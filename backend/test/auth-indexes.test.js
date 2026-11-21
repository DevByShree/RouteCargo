const { test } = require("node:test");
const assert = require("node:assert/strict");

test("startup removes the obsolete unique userId index without modifying user records", async () => {
  const dropped = [];
  const created = [];
  const fakeUser = {
    schema: { path: () => undefined },
    collection: {
      async indexes() {
        return [
          { name: "_id_", key: { _id: 1 }, unique: true },
          { name: "userId_1", key: { userId: 1 }, unique: true },
          { name: "email_1", key: { email: 1 }, unique: false },
        ];
      },
      async dropIndex(name) { dropped.push(name); },
      async createIndex(keys, options) { created.push({ keys, options }); },
    },
    async aggregate() { return []; },
  };
  const modulePath = require.resolve("../src/models/User");
  const previous = require.cache[modulePath];
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports: fakeUser };
  delete require.cache[require.resolve("../src/config/authIndexes")];

  try {
    const { ensureAuthIndexes } = require("../src/config/authIndexes");
    await ensureAuthIndexes();
    assert.deepEqual(dropped, ["userId_1"]);
    assert.equal(created.length, 1);
    assert.equal(created[0].options.unique, true);
    assert.equal(created[0].options.partialFilterExpression.phone.$type, "string");
  } finally {
    if (previous) require.cache[modulePath] = previous;
    else delete require.cache[modulePath];
    delete require.cache[require.resolve("../src/config/authIndexes")];
  }
});
