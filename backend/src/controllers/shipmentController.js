
const Shipment = require("../models/Shipment");
const Counter = require("../models/Counter");
const User = require("../models/User");

const createShipment = async (req, res) => {
    try {
        const { pickup, destination } = req.body;

        // 1. Validate input

        if (typeof pickup !== "string" || !pickup.trim() || typeof destination !== "string" || !destination.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Pickup and destination are required",
            });
        }

        // 2. Get logged-in user from database
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const existingShipment = await Shipment.findOne({
            userId: user.userId,
            pickup: pickup.trim(),
            destination: destination.trim(),
        });

        if (existingShipment) {
            return res.status(409).json({
                success: false,
                message: "Shipment already created",
                data: existingShipment,
            });
        }

        // 3. Generate automatic shipment ID
        const counter = await Counter.findByIdAndUpdate(
            "shipment",
            { $inc: { seq: 1 } },
            {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        // 4. Create shipment
        const shipment = await Shipment.create({
            shipmentid: counter.seq,
            userId: user.userId,
            pickup: pickup.trim(),
            destination: destination.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Shipment created successfully",
            data: shipment,
        });
    } catch (error) {
        console.error("Create shipment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create shipment",
        });
    }
};

module.exports = { createShipment };
