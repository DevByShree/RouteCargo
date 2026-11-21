const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

process.env.JWT_SECRET = "test-only-secret-with-at-least-thirty-two-bytes";
process.env.NODE_ENV = "test";

const users = [];
const sessions = [];
const driverProfiles = new Map();
let nextUserId = 0;
let nextSessionId = 0;

function query(value) {
  return {
    select() { return this; },
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
  };
}

const User = {
  findOne(criteria) {
    const matches = (user, condition) => Object.entries(condition).every(([key, value]) => {
      if (key === "_id" && value?.$ne) return user._id !== String(value.$ne);
      if (value && Array.isArray(value.$in)) return value.$in.includes(user[key]);
      if (value instanceof RegExp) return value.test(user[key] || "");
      return user[key] === value;
    });
    const found = criteria.$or
      ? users.find((user) => criteria.$or.some((condition) => matches(user, condition)))
      : users.find((user) => matches(user, criteria));
    return query(found || null);
  },
  async findById(id) { return users.find((user) => user._id === String(id)) || null; },
  async create(input) {
    if (Array.isArray(input)) return Promise.all(input.map((entry) => User.create(entry)));
    if (users.some((user) => user.email === input.email || (input.phone && user.phone === input.phone))) {
      const error = new Error("Duplicate key");
      error.code = 11000;
      error.keyPattern = { email: 1 };
      throw error;
    }
    const user = {
      ...input,
      _id: String(++nextUserId),
      password: await bcrypt.hash(input.password, 12),
      async save() { return this; },
      async matchPassword(candidate) { return bcrypt.compare(candidate, this.password); },
    };
    users.push(user);
    return user;
  },
};

const DriverProfile = {
  async updateOne(criteria, update) {
    const key = String(criteria.userId);
    driverProfiles.set(key, {
      ...(driverProfiles.get(key) || update.$setOnInsert),
      ...(update.$set || {}),
    });
    return { upsertedCount: 1 };
  },
};

mongoose.startSession = async () => ({
  async withTransaction(callback) { await callback(); },
  async endSession() {},
});

const AuthSession = {
  async create(input) {
    if (Array.isArray(input)) return Promise.all(input.map((entry) => AuthSession.create(entry)));
    const session = { ...input, _id: String(++nextSessionId), revokedAt: null };
    sessions.push(session);
    return session;
  },
  async findOne(criteria) {
    return sessions.find((session) => session.tokenHash === criteria.tokenHash) || null;
  },
  async findOneAndUpdate(criteria, update) {
    const session = sessions.find((entry) => entry._id === String(criteria._id)
      && entry.revokedAt === null
      && entry.expiresAt > criteria.expiresAt.$gt);
    if (!session) return null;
    Object.assign(session, update.$set);
    return session;
  },
  async updateMany(criteria, update) {
    let modifiedCount = 0;
    for (const session of sessions) {
      if (session.familyId === criteria.familyId && session.revokedAt === null) {
        Object.assign(session, update.$set);
        modifiedCount += 1;
      }
    }
    return { modifiedCount };
  },
  async exists(criteria) {
    return sessions.some((session) => session.userId === String(criteria.userId)
      && session.familyId === criteria.familyId
      && session.revokedAt === null
      && session.expiresAt > criteria.expiresAt.$gt);
  },
};

function stubModel(modulePath, exports) {
  const resolved = require.resolve(modulePath);
  require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports };
}

stubModel("../src/models/User", User);
stubModel("../src/models/AuthSession", AuthSession);
stubModel("../src/models/DriverProfile", DriverProfile);
const authRoutes = require("../src/routes/auth");
const { authenticate, authorize } = require("../src/middleware/authMiddleware");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.get("/api/customer-only", authenticate, authorize("customer"), (_req, res) => res.json({ success: true }));
app.get("/api/driver-only-test", authenticate, authorize("driver"), (_req, res) => res.json({ success: true }));

let server;
let origin;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

function applyCookies(jar, response) {
  for (const header of response.headers.getSetCookie()) {
    const [pair, ...attributes] = header.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    if (!value || attributes.some((attribute) => /^\s*Max-Age=0\s*$/i.test(attribute))) jar.delete(name);
    else jar.set(name, value);
  }
}

async function call(path, { method = "GET", body, jar = new Map() } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (jar.size) headers.Cookie = [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
  const response = await fetch(`${origin}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  applyCookies(jar, response);
  return { response, data: await response.json() };
}

test("registration validates fields, hashes passwords, and rejects duplicate accounts/roles", async () => {
  const customer = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Customer", email: "CASEY@example.com", phone: "+919876543210", password: "correct horse battery", role: "customer" },
  });
  assert.equal(customer.response.status, 201);
  assert.equal(customer.data.user.role, "customer");
  assert.equal(Object.hasOwn(customer.data.user, "password"), false);
  assert.notEqual(users[0].password, "correct horse battery");
  assert.equal(await bcrypt.compare("correct horse battery", users[0].password), true);

  const duplicateEmail = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Another User", email: "casey@example.com", password: "correct horse battery", role: "customer" },
  });
  assert.equal(duplicateEmail.response.status, 409);

  const duplicatePhone = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Another User", email: "other@example.com", phone: "09876543210", password: "correct horse battery", role: "customer" },
  });
  assert.equal(duplicatePhone.response.status, 409);
  assert.match(duplicatePhone.data.message, /phone number/);

  users.push({ _id: "legacy-phone-user", email: "legacy@example.com", phone: "+91-98765-43212" });
  const legacyFormattedPhone = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Phone Match", email: "phone-match@example.com", phone: "9876543212", password: "correct horse battery", role: "customer" },
  });
  assert.equal(legacyFormattedPhone.response.status, 409);
  assert.match(legacyFormattedPhone.data.message, /phone number/);

  const invalidRole = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Privileged User", email: "admin@example.com", password: "correct horse battery", role: "admin" },
  });
  assert.equal(invalidRole.response.status, 400);

  const shortPassword = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Short Password", email: "short@example.com", password: "1234567", role: "customer" },
  });
  assert.equal(shortPassword.response.status, 400);
});

test("email and phone sign-in set HttpOnly cookies and never return a refresh token", async () => {
  const driverSignup = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "Drew Driver", email: "drew@example.com", phone: "+919876543211", password: "driver password", role: "driver" },
  });
  assert.equal(driverSignup.response.status, 201);
  assert.equal(driverProfiles.size, 1);
  assert.equal([...driverProfiles.values()][0].userId, users.find((user) => user.email === "drew@example.com")._id);
  assert.equal(driverSignup.data.user.role, "driver");

  const driverCookies = new Map();
  const login = await call("/api/auth/signin", {
    method: "POST",
    jar: driverCookies,
    body: { identifier: "+91 98765 43211", password: "driver password" },
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.user.role, "driver");
  assert.equal(Object.hasOwn(login.data, "refreshToken"), false);
  assert.ok(driverCookies.has("rc_access"));
  assert.ok(driverCookies.has("rc_refresh"));
  assert.match(login.response.headers.getSetCookie().join(";"), /HttpOnly/i);

  const accessPayload = jwt.verify(driverCookies.get("rc_access"), process.env.JWT_SECRET, {
    algorithms: ["HS256"], issuer: "routecargo-api", audience: "routecargo-client",
  });
  assert.equal(accessPayload.exp - accessPayload.iat, 15 * 60);
  assert.equal(sessions.find((session) => session.familyId === accessPayload.sid).expiresAt.getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000, true);

  const badPassword = await call("/api/auth/signin", {
    body: { identifier: "drew@example.com", password: "wrong password" },
    method: "POST",
  });
  assert.equal(badPassword.response.status, 401);

  const invalidEmail = await call("/api/auth/signin", {
    body: { identifier: "not-an-email", password: "wrong password" },
    method: "POST",
  });
  assert.equal(invalidEmail.response.status, 400);
});

test("a legacy driver without a profile is synchronized on login and can access the driver role", async () => {
  const driver = users.find((user) => user.email === "drew@example.com");
  driverProfiles.delete(driver._id);
  const cookies = new Map();
  const login = await call("/api/auth/signin", {
    method: "POST", jar: cookies,
    body: { identifier: "drew@example.com", password: "driver password" },
  });
  assert.equal(login.response.status, 200);
  assert.equal(driverProfiles.get(driver._id).contactNumber, "+919876543211");
  assert.equal((await call("/api/driver-only-test", { jar: cookies })).response.status, 200);
});

test("driver registration requires a usable phone number", async () => {
  const response = await call("/api/auth/signup", {
    method: "POST",
    body: { name: "No Phone Driver", email: "nophone@example.com", password: "driver password", role: "driver" },
  });
  assert.equal(response.response.status, 400);
  assert.match(response.data.message, /phone number is required/i);
});

test("protected routes enforce roles, refresh rotates tokens, and reuse revokes the family", async () => {
  const customerCookies = new Map();
  const login = await call("/api/auth/signin", {
    method: "POST",
    jar: customerCookies,
    body: { email: "casey@example.com", password: "correct horse battery" },
  });
  assert.equal(login.response.status, 200);

  const anonymous = await call("/api/customer-only");
  assert.equal(anonymous.response.status, 401);

  const forbidden = await call("/api/driver-only-test", { jar: customerCookies });
  assert.equal(forbidden.response.status, 403);
  const allowed = await call("/api/customer-only", { jar: customerCookies });
  assert.equal(allowed.response.status, 200);

  const oldRefresh = customerCookies.get("rc_refresh");
  const rotated = await call("/api/auth/refresh", { method: "POST", jar: customerCookies });
  assert.equal(rotated.response.status, 200);
  assert.notEqual(customerCookies.get("rc_refresh"), oldRefresh);
  assert.equal((await call("/api/auth/me", { jar: customerCookies })).response.status, 200);

  const reused = new Map([["rc_refresh", oldRefresh]]);
  const rejectedReuse = await call("/api/auth/refresh", { method: "POST", jar: reused });
  assert.equal(rejectedReuse.response.status, 401);
  assert.equal(rejectedReuse.data.code, "REFRESH_REUSE_DETECTED");
  assert.equal((await call("/api/auth/me", { jar: customerCookies })).response.status, 401);
});

test("profile updates keep the account role server-controlled and enforce unique phone numbers", async () => {
  const cookies = new Map();
  await call("/api/auth/signin", {
    method: "POST", jar: cookies,
    body: { email: "casey@example.com", password: "correct horse battery" },
  });

  const duplicatePhone = await call("/api/auth/me", {
    method: "PUT",
    jar: cookies,
    body: { phone: "+919876543211", role: "driver" },
  });
  assert.equal(duplicatePhone.response.status, 409);

  const updated = await call("/api/auth/me", {
    method: "PUT",
    jar: cookies,
    body: { name: "Casey Updated", company: "RouteCargo", role: "driver" },
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.user.name, "Casey Updated");
  assert.equal(updated.data.user.role, "customer");
});

test("logout revokes only its own session family and expired access tokens are rejected", async () => {
  const firstSession = new Map();
  const secondSession = new Map();
  await call("/api/auth/signin", {
    method: "POST", jar: firstSession,
    body: { email: "casey@example.com", password: "correct horse battery" },
  });
  await call("/api/auth/signin", {
    method: "POST", jar: secondSession,
    body: { email: "casey@example.com", password: "correct horse battery" },
  });

  const expiredAccess = jwt.sign(
    { role: "customer", sid: "unused-family" },
    process.env.JWT_SECRET,
    { algorithm: "HS256", subject: "1", issuer: "routecargo-api", audience: "routecargo-client", expiresIn: -1 }
  );
  const expired = await call("/api/auth/me", { jar: new Map([["rc_access", expiredAccess]]) });
  assert.equal(expired.response.status, 401);
  assert.equal(expired.data.code, "ACCESS_TOKEN_EXPIRED");

  const signedOut = await call("/api/auth/signout", { method: "POST", jar: firstSession });
  assert.equal(signedOut.response.status, 200);
  assert.equal(firstSession.has("rc_refresh"), false);
  assert.equal((await call("/api/auth/me", { jar: firstSession })).response.status, 401);
  assert.equal((await call("/api/auth/me", { jar: secondSession })).response.status, 200);
});

test("expired refresh tokens are rejected and their session family is revoked", async () => {
  const cookies = new Map();
  await call("/api/auth/signin", {
    method: "POST", jar: cookies,
    body: { email: "casey@example.com", password: "correct horse battery" },
  });
  const oldTokenHash = require("node:crypto").createHash("sha256").update(cookies.get("rc_refresh")).digest("hex");
  const session = sessions.find((entry) => entry.tokenHash === oldTokenHash);
  session.expiresAt = new Date(Date.now() - 1000);

  const expired = await call("/api/auth/refresh", { method: "POST", jar: cookies });
  assert.equal(expired.response.status, 401);
  assert.equal(expired.data.code, "REFRESH_EXPIRED");
  assert.equal(session.revokedAt instanceof Date, true);
});
