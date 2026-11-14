import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import driverRoutes from "./routes/driver.js";
import vehicleRoutes from "./routes/vehicles.js";
import requestRoutes from "./routes/requests.js";
import capacityRoutes from "./routes/capacity.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(s => s.trim()) : true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

// Preserve the existing auth router. If your auth routes use a different prefix,
// keep your current mount path and update the frontend API base URL accordingly.
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/driver/vehicles", vehicleRoutes);
app.use("/api/driver/requests", requestRoutes);
app.use("/api/driver/capacity", capacityRoutes);

app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok", service: "RouteCargo API"
  }));

app.use((req, res) =>
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  }));

app.use((err, req, res, _next) => {
  console.error(err);
  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.code === "LIMIT_FILE_SIZE" ? "File is too large." : err.message
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({
      message: "A record with this value already exists.",
      fields: err.keyValue
    });
  }
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error."
  });
});

export default app;
