const User = require("../models/User");

async function ensureAuthIndexes() {
  if (!User.schema.path("userId")) {
    let indexes = [];
    try {
      indexes = await User.collection.indexes();
    } catch (error) {
      if (error.codeName !== "NamespaceNotFound") throw error;
    }

    const obsoleteUserIdIndex = indexes.find((index) =>
      index.unique === true
      && Object.keys(index.key || {}).length === 1
      && index.key.userId === 1
    );
    if (obsoleteUserIdIndex) {
      await User.collection.dropIndex(obsoleteUserIdIndex.name);
      console.warn(`Removed obsolete unique index ${obsoleteUserIdIndex.name} from users; current User records use MongoDB _id.`);
    }
  }

  const duplicatePhones = await User.aggregate([
    { $match: { phone: { $type: "string", $gt: "" } } },
    { $group: { _id: "$phone", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]);

  if (duplicatePhones.length) {
    throw new Error("Duplicate phone numbers exist; resolve them before enabling phone uniqueness");
  }

  await User.collection.createIndex(
    { phone: 1 },
    {
      name: "phone_unique_when_present",
      unique: true,
      partialFilterExpression: { phone: { $type: "string", $gt: "" } },
    }
  );
}

module.exports = { ensureAuthIndexes };
