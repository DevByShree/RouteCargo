
const Booking = require("../models/Booking");

const createBookingRequest = async (req, res) => {
    try {
        const { truckId, shipmentId } = req.body;

        // Validate required fields
        if (truckId == null || shipmentId == null) {
            return res.status(400).json({
                success: false,
                message: "Truck ID and Shipment ID are required",
            });
        }

        // Validate numeric IDs
        if (
            !Number.isSafeInteger(Number(truckId)) ||
            Number(truckId) <= 0 ||
            !Number.isSafeInteger(Number(shipmentId)) ||
            Number(shipmentId) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Truck ID and Shipment ID must be valid positive numbers",
            });
        }

        // Create booking request
        const booking = await Booking.create({
            truckId: Number(truckId),
            shipmentId: Number(shipmentId),
        });

        return res.status(201).json({
            success: true,
            message: "Booking request sent successfully",
            booking,
        });
    } catch (error) {
        console.error("Booking request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create booking request",
        });
    }
};

module.exports = { createBookingRequest };
