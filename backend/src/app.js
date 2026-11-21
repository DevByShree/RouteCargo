const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const driverRoutes = require("./routes/driverRoutes");
const shipmentRoutes = require("./routes/shipment");
const parcelRoutes = require("./routes/parcel");
const bookingRoutes = require("./routes/booking");

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin) ? origin || false : false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", (req, res, next) => {
  const origin = req.get("origin");
  const changesState = !["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (changesState && origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, message: "Origin is not allowed" });
  }
  return next();
});

app.get("/", (_req, res) => {
  res.send("RouteCargo Backend is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/parcel", parcelRoutes);
app.use("/api/booking", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "File is too large." : err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : "Internal server error",
  });
});

module.exports = app;
