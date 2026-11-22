const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Numeric IDs remain optional for backwards compatibility with old records.
  truckId: { type: Number },
  shipmentId: { type: Number, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  driverProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "DriverProfile" },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  availabilityId: { type: mongoose.Schema.Types.ObjectId, ref: "CapacityPost" },
  shipmentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment" },
  requestedCapacityKg: { type: Number, min: 0 },
  amount: { type: Number, min: 0, default: 0 },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled", "in_transit", "delivered", "completed"],
    default: "pending",
  },
}, { timestamps: true });

bookingSchema.index(
  { customerId: 1, shipmentRef: 1, availabilityId: 1 },
  { unique: true, partialFilterExpression: { availabilityId: { $type: "objectId" } } }
);
bookingSchema.index({ driverId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
