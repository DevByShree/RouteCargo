const mongoose = require("mongoose")

const ShipmentSchema = new mongoose.Schema(
    {
        shipmentid: {
            type: Number,
            unique: true,
            required: true,
        },
        userId: {
            type: Number,
            unique: true,
            index: true,
        },
        pickup: {
            type: String,
            required: true,
            trim: true,
        },
        destination: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true, versionKey: false }
)
module.exports = mongoose.model("Shipment", ShipmentSchema);
