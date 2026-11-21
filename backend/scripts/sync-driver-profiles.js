const fs = require("fs");
const path = require("path");
const fileEnvironment = require("dotenv").parse(fs.readFileSync(path.join(__dirname, "../.env"), "utf8"));
const mongoose = require("mongoose");
const User = require("../src/models/User");
const DriverProfile = require("../src/models/DriverProfile");

async function syncDriverProfiles({ apply = false } = {}) {
  const [userRoles, profileCount] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    DriverProfile.countDocuments(),
  ]);
  const drivers = await User.find({ role: "driver" }).select("_id name email phone").lean();
  const existing = await DriverProfile.find({ userId: { $in: drivers.map((user) => user._id) } })
    .select("userId")
    .lean();
  const existingIds = new Set(existing.map((profile) => String(profile.userId)));
  const missing = drivers.filter((user) => !existingIds.has(String(user._id)));
  let created = 0;
  for (const user of apply ? missing : []) {
    const result = await DriverProfile.updateOne(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          ownerName: user.name,
          contactNumber: user.phone || "",
          email: user.email,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
  }
  return {
    userCount: userRoles.reduce((sum, group) => sum + group.count, 0),
    userRoles: Object.fromEntries(userRoles.map(({ _id, count }) => [String(_id || "(unset)"), count])),
    driverUsers: drivers.length,
    driverProfiles: profileCount,
    profilesMissing: missing.length,
    profilesCreated: created,
    mode: apply ? "apply" : "dry-run",
  };
}

if (require.main === module) {
  if (!fileEnvironment.MONGO_URI) {
    console.error("MONGO_URI is required");
    process.exitCode = 1;
  } else {
    const databaseArgument = process.argv.find((argument) => argument.startsWith("--database="));
    const connectionUri = fileEnvironment.MONGO_URI.trim().replace(/^['"]|['"]$/g, "");
    if (databaseArgument) {
      const parsedUri = new URL(connectionUri);
      parsedUri.pathname = `/${databaseArgument.slice("--database=".length)}`;
      mongoose.connect(parsedUri.toString());
    } else {
      mongoose.connect(new URL(connectionUri).toString());
    }
    mongoose.connection.asPromise().then(async () => {
        const result = await syncDriverProfiles({ apply: process.argv.includes("--apply") });
        console.log(JSON.stringify(result));
      })
      .catch((error) => {
        console.error(`Driver profile synchronization failed: ${error.message}`);
        process.exitCode = 1;
      })
      .finally(() => mongoose.disconnect());
  }
}

module.exports = { syncDriverProfiles };
