const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./src/routes/auth");
const driverRoutes = require("./src/routes/driverRoutes");
const shipmentRoutes = require("./src/routes/shipment");
const parcelRoutes = require("./src/routes/parcel");

<<<<<<< HEAD
<<<<<<< HEAD

=======
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const driverRoutes = require('./src/routes/driverRoutes');
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

<<<<<<< HEAD
<<<<<<< HEAD
// Health check
app.get("/", (req, res) => {
    res.send("RouteCargo Backend is running!");
});
// User Side
const ShipmentRoutes = require("./src/routes/shipment")
const ParcelRoutes = require("./src/routes/parcel")

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/shipments", ShipmentRoutes);

app.use("/api/parcel", ParcelRoutes);
app.use("/api/parcels", require("./src/routes/parcel"));
<<<<<<< HEAD
=======
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
=======
app.use("/api/booking", require("./src/routes/booking"));
>>>>>>> 56df870949908fa44df9adeccb225d2ffe3e3ead

app.get('/', (req, res) =>
    res.json({
        success: true,
        message: 'RouteCargo Backend is running!'
    }));

app.use('/api/auth', authRoutes);

app.use('/api/driver', driverRoutes);

app.use((req, res) =>
    res.status(404).json({
        success: false,
        message: 'Route not found'
    }));
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
app.get("/", (_req, res) => res.send("RouteCargo Backend is running!"));
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/parcel", parcelRoutes);
app.use("/api/parcels", parcelRoutes);
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.code === "LIMIT_FILE_SIZE" ? "File is too large." : err.message });
  }
  res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Internal server error" });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error("MONGO_URI and JWT_SECRET must be configured in .env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
