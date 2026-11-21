const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const env = require("dotenv").parse(fs.readFileSync(path.join(__dirname, "../.env"), "utf8"));
const User = require("../src/models/User");
const DriverProfile = require("../src/models/DriverProfile");
const AuthSession = require("../src/models/AuthSession");

async function verify() {
  if (!env.MONGO_URI) throw new Error("MONGO_URI is required in backend/.env");
  await mongoose.connect(new URL(env.MONGO_URI.trim().replace(/^['"]|['"]$/g, "")).toString());
  await Promise.all([User.init(), DriverProfile.init(), AuthSession.init()]);

  const runId = crypto.randomUUID();
  const email = `transaction-probe-${runId}@example.invalid`;
  const phone = `+919${crypto.randomInt(100000000, 999999999)}`;
  const familyId = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(runId).digest("hex");
  let user;
  let stage = "starting transaction";
  const rollback = new Error("intentional verification rollback");

  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        stage = "creating driver user";
        [user] = await User.create([{
          name: "Transaction Verification",
          email,
          phone,
          password: "verification-only-password",
          role: "driver",
        }], { session });

        stage = "creating linked driver profile";
        await DriverProfile.updateOne(
          { userId: user._id },
          {
            $set: { ownerName: user.name, contactNumber: user.phone, email: user.email },
            $setOnInsert: { userId: user._id },
          },
          { upsert: true, session }
        );

        stage = "creating refresh session";
        await AuthSession.create([{
          userId: user._id,
          familyId,
          tokenHash,
          expiresAt: new Date(Date.now() + 60_000),
        }], { session });
        throw rollback;
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    if (error !== rollback) {
      const validationFields = Object.values(error.errors || {}).map(({ path: field, kind }) => ({ field, kind }));
      const userIndexes = (await User.collection.indexes())
        .filter((index) => Object.keys(index.key || {}).includes("userId"))
        .map(({ name, key, unique, sparse, partialFilterExpression }) => ({ name, key, unique, sparse, partialFilterExpression }));
      const [existingUsers, usersWithLegacyUserId] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ userId: { $exists: true } }),
      ]);
      const details = {
        failedAt: stage,
        name: error.name,
        code: error.code,
        codeName: error.codeName,
        validationFields,
        currentUserSchemaHasUserId: Boolean(User.schema.path("userId")),
        userIndexes,
        existingUsers,
        usersWithLegacyUserId,
        message: String(error.message || "Unknown error")
          .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[connection string redacted]")
          .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]")
          .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone redacted]")
          .slice(0, 300),
      };
      console.error(JSON.stringify(details));
      process.exitCode = 1;
      return;
    }

    const [userCount, profileCount, authSessionCount] = await Promise.all([
      User.countDocuments({ email }),
      DriverProfile.countDocuments({ userId: user._id }),
      AuthSession.countDocuments({ tokenHash }),
    ]);
    if (userCount || profileCount || authSessionCount) {
      throw new Error("Verification transaction rollback left records behind");
    }
    const indexes = await User.collection.indexes();
    const obsoleteIndexPresent = indexes.some((index) => index.unique === true
      && Object.keys(index.key || {}).length === 1
      && index.key.userId === 1);
    console.log(JSON.stringify({
      transactionFlow: "passed",
      obsoleteUserIdIndexPresent: obsoleteIndexPresent,
      userRecordsLeft: 0,
      driverProfilesLeft: 0,
      authSessionsLeft: 0,
    }));
  }
}

verify()
  .catch((error) => {
    console.error(`Transaction verification failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
