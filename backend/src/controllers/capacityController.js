import { body } from "express-validator";
import Vehicle from "../models/Vehicle.js";
import CapacityPost from "../models/CapacityPost.js";

const userId = req => req.user?._id || req.user?.id;
const units = ["tons", "kg", "cubic meters", "packages"];
const allowedLoads = ["Small goods", "Industrial goods", "Fragile goods", "General cargo"];

export const capacityValidation = [
  body("truckId").isMongoId(),
  body("availableCapacity").isFloat({ gt: 0 }).toFloat(),
  body("date").isISO8601().toDate(),
  body("from").isString().trim().isLength({ min: 1, max: 150 }),
  body("to").isString().trim().isLength({ min: 1, max: 150 }),
  body("loadTypes").custom(v => {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every(x => allowedLoads.includes(x));
  }).withMessage("Select at least one supported load type.")
];

export async function listCapacity(req, res, next) {
  try {
    const posts = await CapacityPost.find({ driver: userId(req) }).populate("vehicle", "name number").sort({ createdAt: -1 }).lean();
    res.json({ data: posts, total: posts.length });
  } catch (e) { next(e); }
}

export async function createCapacity(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.body.truckId, owner: userId(req), available: true });
    if (!vehicle) return res.status(404).json({ message: "Available registered vehicle not found." });
    const availableCapacity = Number(req.body.availableCapacity);
    if (!Number.isFinite(availableCapacity) || availableCapacity <= 0 || availableCapacity > vehicle.capacity) {
      return res.status(400).json({ message: `Available capacity must be greater than 0 and no more than ${vehicle.capacity} ${vehicle.capacityUnit}.` });
    }
    const from = String(req.body.from || "").trim();
    const to = String(req.body.to || "").trim();
    if (from.toLowerCase() === to.toLowerCase()) return res.status(400).json({ message: "Pickup and destination must be different." });
    let loadTypes = req.body.loadTypes;
    if (typeof loadTypes === "string") {
      try { loadTypes = JSON.parse(loadTypes); } catch { loadTypes = [loadTypes]; }
    }
    if (!Array.isArray(loadTypes) || !loadTypes.length || loadTypes.some(t => !allowedLoads.includes(t))) {
      return res.status(400).json({ message: "Select at least one valid cargo type." });
    }
    const profile = req.driverProfile || {};
    const post = await CapacityPost.create({
      driver: userId(req), vehicle: vehicle._id,
      truckName: vehicle.name, truckNumber: vehicle.number, vehicleType: vehicle.type,
      totalCapacity: vehicle.capacity, capacityUnit: vehicle.capacityUnit, availableCapacity,
      date: req.body.date, from, to, loadTypes,
      companyName: req.body.companyName || profile.companyName || "",
      gstNumber: req.body.gstNumber || profile.gstNumber || "",
      contactName: req.body.contactName || profile.ownerName || req.user.name || "",
      contactPhone: req.body.contactPhone || profile.contactNumber || "",
      notes: req.body.notes || ""
    });
    res.status(201).json({ message: "Available truck capacity published.", data: post });
  } catch (e) { next(e); }
}

export async function deleteCapacity(req, res, next) {
  try {
    const post = await CapacityPost.findOneAndDelete({ _id: req.params.id, driver: userId(req) });
    if (!post) return res.status(404).json({ message: "Capacity listing not found." });
    res.json({ message: "Capacity listing deleted." });
  } catch (e) { next(e); }
}
