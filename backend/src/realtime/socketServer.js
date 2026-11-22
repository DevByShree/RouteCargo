const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const AuthSession = require("../models/AuthSession");
const { attachNotificationHub } = require("./notificationHub");

const JWT_ISSUER = "routecargo-api";
const JWT_AUDIENCE = "routecargo-client";

function accessTokenFromCookie(header = "") {
  const tokenPair = header.split(";").map(value => value.trim()).find(value => value.startsWith("rc_access="));
  if (!tokenPair) return null;
  try { return decodeURIComponent(tokenPair.slice("rc_access=".length)); } catch { return null; }
}

function createSocketServer(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  io.use(async (socket, next) => {
    const token = accessTokenFromCookie(socket.handshake.headers.cookie);
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      if (!payload.sub || !payload.sid || !["customer", "driver"].includes(payload.role)) {
        return next(new Error("Invalid session"));
      }
      const activeSession = await AuthSession.exists({
        userId: payload.sub,
        familyId: payload.sid,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });
      if (!activeSession) return next(new Error("Session expired"));
      socket.data.user = { id: payload.sub, role: payload.role, sessionId: payload.sid };
      return next();
    } catch {
      return next(new Error("Invalid session"));
    }
  });

  io.on("connection", socket => {
    socket.join(`user:${socket.data.user.id}`);
    socket.join(`session:${socket.data.user.sessionId}`);
  });

  attachNotificationHub(io);
  return io;
}

module.exports = { createSocketServer, accessTokenFromCookie };
