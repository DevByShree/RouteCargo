
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        truckId: {
            type: Number,
            required: true,
        },

        shipmentId: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
