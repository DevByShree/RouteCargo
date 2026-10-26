const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./src/routes/auth");


const app = express();

// CORS — allow frontend origin with credentials (httpOnly cookies)
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

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

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

startServer();
