const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AuthSession = require("../models/AuthSession");
const { disconnectSession } = require("../realtime/notificationHub");
const User = require("../models/User");
const DriverProfile = require("../models/DriverProfile");
const mongoose = require("mongoose");
const { normalizePhone, phoneLookupConditions } = require("../utils/phone");

const ACCESS_TOKEN_MINUTES = 15;
const REFRESH_TOKEN_DAYS = Math.min(90, Math.max(1, Math.trunc(Number(process.env.REFRESH_TOKEN_DAYS) || 30)));
const JWT_ISSUER = "routecargo-api";
const JWT_AUDIENCE = "routecargo-client";

const requestedSameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
if (!["lax", "strict", "none"].includes(requestedSameSite)) {
  throw new Error("COOKIE_SAME_SITE must be lax, strict, or none");
}
const sameSite = requestedSameSite;
const cookiesSecure = process.env.NODE_ENV === "production" || sameSite === "none";
const accessCookieOptions = {
  httpOnly: true,
  secure: cookiesSecure,
  sameSite,
  path: "/",
  maxAge: ACCESS_TOKEN_MINUTES * 60 * 1000,
};
const refreshCookieOptions = {
  httpOnly: true,
  secure: cookiesSecure,
  sameSite,
  path: "/api/auth",
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;

async function ensureDriverProfile(user, session) {
  if (user.role !== "driver") return;
  await DriverProfile.updateOne(
    { userId: user._id },
    {
      $set: { ownerName: user.name, contactNumber: user.phone || "", email: user.email },
      $setOnInsert: { userId: user._id },
    },
    { upsert: true, ...(session ? { session } : {}) }
  );
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    company: user.company || "",
    profilePhoto: user.profilePhoto || "",
    role: user.role,
  };
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function newRefreshToken() {
  return crypto.randomBytes(64).toString("base64url");
}

function createAccessToken(user, familyId) {
  return jwt.sign(
    { role: user.role, sid: familyId },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      subject: String(user._id),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: `${ACCESS_TOKEN_MINUTES}m`,
    }
  );
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("rc_access", accessToken, accessCookieOptions);
  res.cookie("rc_refresh", refreshToken, refreshCookieOptions);
}

function clearAuthCookies(res) {
  res.clearCookie("rc_access", {
    httpOnly: true,
    secure: cookiesSecure,
    sameSite,
    path: "/",
  });
  res.clearCookie("rc_refresh", {
    httpOnly: true,
    secure: cookiesSecure,
    sameSite,
    path: "/api/auth",
  });
}

async function issueSession(user, familyId = crypto.randomUUID(), dbSession) {
  const refreshToken = newRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + refreshCookieOptions.maxAge);

  const sessionRecord = {
    userId: user._id,
    familyId,
    tokenHash,
    expiresAt,
  };
  if (dbSession) await AuthSession.create([sessionRecord], { session: dbSession });
  else await AuthSession.create(sessionRecord);

  return {
    refreshToken,
    accessToken: createAccessToken(user, familyId),
  };
}

function authResponse(user, message) {
  return {
    success: true,
    ...(message ? { message } : {}),
    user: publicUser(user),
    accessTokenExpiresIn: `${ACCESS_TOKEN_MINUTES}m`,
  };
}

function duplicateAccountResponse(error, res) {
  if (error?.code !== 11000) return null;
  const duplicateKey = Object.keys(error.keyPattern || error.keyValue || {})[0];
  if (!(duplicateKey === "phone" || duplicateKey === "email")) return null;
  const field = duplicateKey === "phone" ? "phone number" : "email";
  return res.status(409).json({
    success: false,
    message: `An account with this ${field} already exists`,
  });
}

function logSignupFailure(error) {
  const validationFields = Object.values(error?.errors || {}).map(({ path, kind }) => ({ path, kind }));
  const duplicateFields = Object.keys(error?.keyPattern || error?.keyValue || {});
  const transactionUnsupported = /transaction numbers are only allowed|replica set|mongos/i.test(error?.message || "");
  const safeMessage = String(error?.message || "Unknown error")
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[connection string redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone redacted]")
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, "[token-like value redacted]")
    .slice(0, 300);
  console.error("Signup failed", JSON.stringify({
    name: error?.name || "Error",
    code: error?.code,
    codeName: error?.codeName,
    validationFields,
    duplicateFields,
    transactionUnsupported,
    message: safeMessage,
  }));
}

exports.signup = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = normalizePhone(body.phone) || undefined;
    const requestedRole = body.role === "user" ? "customer" : body.role;
    const role = requestedRole === undefined ? "customer" : requestedRole;

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ success: false, message: "Name must be between 2 and 80 characters" });
    }
    if (!emailPattern.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }
    if (Buffer.byteLength(password, "utf8") < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes",
      });
    }
    if (body.phone && !phone) {
      return res.status(400).json({ success: false, message: "Enter a valid phone number" });
    }
    if (role === "driver" && !phone) {
      return res.status(400).json({ success: false, message: "A phone number is required for driver registration" });
    }
    if (!(["customer", "driver"].includes(role))) {
      return res.status(400).json({ success: false, message: "Role must be customer or driver" });
    }

    const phoneConditions = phone ? phoneLookupConditions(phone) : [];
    const duplicate = await User.findOne({
      $or: [{ email }, ...phoneConditions],
    }).select("email phone");
    if (duplicate) {
      const field = duplicate.email?.toLowerCase() === email ? "email" : "phone number";
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists`,
      });
    }

    let user;
    let tokens;
    if (role === "driver") {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          [user] = await User.create([{ name, email, phone, password, role }], { session });
          await ensureDriverProfile(user, session);
          tokens = await issueSession(user, undefined, session);
        });
      } finally {
        await session.endSession();
      }
    } else {
      user = await User.create({ name, email, phone, password, role });
      tokens = await issueSession(user);
    }
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.status(201).json({
      ...authResponse(user, "Account created successfully"),
    });
  } catch (error) {
    const duplicateResponse = duplicateAccountResponse(error, res);
    if (duplicateResponse) return duplicateResponse;
    if (error.name === "ValidationError") {
      const fields = Object.keys(error.errors || {});
      logSignupFailure(error);
      return res.status(400).json({
        success: false,
        message: fields.length ? `Invalid registration fields: ${fields.join(", ")}` : "Please check the registration details",
      });
    }
    logSignupFailure(error);
    if (/transaction numbers are only allowed|replica set|mongos/i.test(error.message || "")) {
      return res.status(503).json({
        success: false,
        code: "TRANSACTIONS_UNAVAILABLE",
        message: "Driver registration requires MongoDB transaction support. Use MongoDB Atlas or a replica set.",
      });
    }
    return res.status(500).json({ success: false, message: "Unable to create account" });
  }
};

exports.signin = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const identifier = typeof body.identifier === "string"
      ? body.identifier.trim()
      : typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email or phone and password are required" });
    }

    let lookup;
    if (identifier.includes("@")) {
      const email = identifier.toLowerCase();
      if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address" });
      }
      lookup = { email };
    } else {
      const phone = normalizePhone(identifier);
      if (!phonePattern.test(phone)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address or phone number" });
      }
      lookup = { $or: phoneLookupConditions(phone) };
    }

    const user = await User.findOne(lookup).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email/phone or password" });
    }

    await ensureDriverProfile(user);
    const tokens = await issueSession(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.json(authResponse(user, "Signed in successfully"));
  } catch (error) {
    console.error("Signin failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to sign in" });
  }
};

exports.refresh = async (req, res) => {
  const presentedToken = req.cookies?.rc_refresh;
  if (!presentedToken) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, code: "REFRESH_REQUIRED", message: "Please sign in again" });
  }

  const now = new Date();
  const session = await AuthSession.findOne({ tokenHash: hashRefreshToken(presentedToken) });
  if (!session) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, code: "REFRESH_INVALID", message: "Please sign in again" });
  }

  if (session.revokedAt) {
    await AuthSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } }
    );
    clearAuthCookies(res);
    return res.status(401).json({ success: false, code: "REFRESH_REUSE_DETECTED", message: "Please sign in again" });
  }

  if (session.expiresAt <= now) {
    await AuthSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } }
    );
    clearAuthCookies(res);
    return res.status(401).json({ success: false, code: "REFRESH_EXPIRED", message: "Please sign in again" });
  }

  const user = await User.findById(session.userId);
  if (!user) {
    await AuthSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } }
    );
    clearAuthCookies(res);
    return res.status(401).json({ success: false, code: "SESSION_INVALID", message: "Please sign in again" });
  }

  const refreshToken = newRefreshToken();
  const replacementHash = hashRefreshToken(refreshToken);
  const rotated = await AuthSession.findOneAndUpdate(
    { _id: session._id, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now, replacedByTokenHash: replacementHash } },
    { new: true }
  );

  if (!rotated) {
    await AuthSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } }
    );
    clearAuthCookies(res);
    return res.status(401).json({ success: false, code: "REFRESH_REUSE_DETECTED", message: "Please sign in again" });
  }

  try {
    const expiresAt = new Date(now.getTime() + refreshCookieOptions.maxAge);
    await AuthSession.create({
      userId: user._id,
      familyId: session.familyId,
      tokenHash: replacementHash,
      expiresAt,
    });
  } catch (error) {
    await AuthSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } }
    );
    clearAuthCookies(res);
    console.error("Refresh rotation failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to refresh session" });
  }

  const accessToken = createAccessToken(user, session.familyId);
  setAuthCookies(res, accessToken, refreshToken);
  return res.json(authResponse(user));
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  await ensureDriverProfile(user);
  return res.json({ success: true, user: publicUser(user) });
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, email, phone, company } = req.body || {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
        return res.status(400).json({ success: false, message: "Name must be between 2 and 80 characters" });
      }
      user.name = name.trim();
    }
    if (email !== undefined) {
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address" });
      }
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists" });
      user.email = normalizedEmail;
    }
    if (phone !== undefined) {
      const normalizedPhone = normalizePhone(phone);
      if (phone && !normalizedPhone) {
        return res.status(400).json({ success: false, message: "Enter a valid phone number" });
      }
      if (normalizedPhone) {
        const phoneConditions = phoneLookupConditions(normalizedPhone)
          .map((condition) => ({ ...condition, _id: { $ne: user._id } }));
        const existing = await User.findOne({ $or: phoneConditions });
        if (existing) return res.status(409).json({ success: false, message: "An account with this phone number already exists" });
      }
      user.phone = normalizedPhone || undefined;
    }
    if (company !== undefined) {
      if (typeof company !== "string" || company.length > 120) {
        return res.status(400).json({ success: false, message: "Company name must be 120 characters or fewer" });
      }
      user.company = company.trim();
    }

    await user.save();
    await ensureDriverProfile(user);
    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    const duplicateResponse = duplicateAccountResponse(error, res);
    if (duplicateResponse) return duplicateResponse;
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Please check the profile details" });
    }
    console.error("Profile update failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update profile" });
  }
};

exports.signout = async (req, res) => {
  const presentedToken = req.cookies?.rc_refresh;
  if (presentedToken) {
    const session = await AuthSession.findOne({ tokenHash: hashRefreshToken(presentedToken) });
    if (session) {
      await AuthSession.updateMany(
        { familyId: session.familyId, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
      await disconnectSession(session.familyId);
    }
  }

  clearAuthCookies(res);
  return res.json({ success: true, message: "Signed out" });
};
