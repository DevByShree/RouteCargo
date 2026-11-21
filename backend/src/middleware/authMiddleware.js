const jwt = require("jsonwebtoken");
const AuthSession = require("../models/AuthSession");

const JWT_ISSUER = "routecargo-api";
const JWT_AUDIENCE = "routecargo-client";

exports.authenticate = async (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = req.cookies?.rc_access || bearer;

  if (!token) {
    return res.status(401).json({ success: false, code: "AUTH_REQUIRED", message: "Please sign in" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  } catch (error) {
    const expired = error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      code: expired ? "ACCESS_TOKEN_EXPIRED" : "ACCESS_TOKEN_INVALID",
      message: expired ? "Access token expired" : "Invalid access token",
    });
  }

  if (!payload.sub || !payload.sid || !["customer", "driver"].includes(payload.role)) {
    return res.status(401).json({ success: false, code: "ACCESS_TOKEN_INVALID", message: "Invalid access token" });
  }

  try {
    const activeSession = await AuthSession.exists({
      userId: payload.sub,
      familyId: payload.sid,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!activeSession) {
      return res.status(401).json({ success: false, code: "SESSION_REVOKED", message: "Please sign in again" });
    }

    req.user = { id: payload.sub, role: payload.role, sessionId: payload.sid };
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized to access this resource" });
  }
  return next();
};
