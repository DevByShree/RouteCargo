const mongoose = require("mongoose");

const trackingLocationSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  accuracyMeters: { type: Number, min: 0, default: null },
  recordedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("TrackingLocation", trackingLocationSchema);
