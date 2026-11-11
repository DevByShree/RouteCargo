import { body } from "express-validator";
import fs from "fs";
import path from "path";
import Vehicle from "../models/Vehicle.js";

const userId = req => req.user?._id || req.user?.id;
const vehicleTypes = ["Tata 14 Wheeler", "Ashok Leyland 16 Wheeler", "Eicher 12 Wheeler", "Tata 10 Wheeler", "BharatBenz 14 Wheeler", "Mahindra Bolero Maxi Truck", "Container 20ft", "Container 32ft Multi-Axle", "Trailer 40ft", "Other"];
const units = ["tons", "kg", "cubic meters", "packages"];
const fuels = ["Diesel", "CNG", "Electric", "Petrol", "LNG", "Other"];

export const vehicleValidation = [
  body("name").isString().trim().isLength({ min: 1, max: 80 }),
  body("number").isString().trim().matches(/^[A-Z0-9 -]{5,20}$/i).withMessage("Enter a valid vehicle registration number."),
  body("type").isString().trim().isLength({ min: 1, max: 80 }),
  body("capacity").isFloat({ gt: 0 }).toFloat(),
  body("capacityUnit").optional().isIn(units),
  body("fuelType").optional().isIn(fuels),
  body("modelYear").optional({ values: "falsy" }).isInt({ min: 1980, max: new Date().getFullYear() + 1 }).toInt(),
  body("available").optional().isBoolean().toBoolean()
];

function fileRecord(file, category) {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/vehicles/${file.filename}`,
    category
  };
}
function uploaded(req, field) { return req.files?.[field] || []; }
function cleanupFiles(req) {
  for (const list of Object.values(req.files || {})) for (const file of list) {
    try { fs.unlinkSync(file.path); } catch {}
  }
}
function parseBoolean(value, fallback = true) {
  if (value === undefined) return fallback;
  return value === true || value === "true";
}

export async function listVehicles(req, res, next) {
  try {
    const vehicles = await Vehicle.find({ owner: userId(req) }).sort({ createdAt: -1 }).lean();
    res.json({ data: vehicles, total: vehicles.length });
  } catch (e) { next(e); }
}

export async function createVehicle(req, res, next) {
  try {
    const number = String(req.body.number || "").trim().toUpperCase();
    const duplicate = await Vehicle.exists({ owner: userId(req), number });
    if (duplicate) { cleanupFiles(req); return res.status(409).json({ message: "This registration number already exists." }); }
    const vehicle = await Vehicle.create({
      owner: userId(req),
      name: req.body.name,
      number,
      type: req.body.type || "Other",
      capacity: Number(req.body.capacity),
      capacityUnit: units.includes(req.body.capacityUnit) ? req.body.capacityUnit : "tons",
      fuelType: fuels.includes(req.body.fuelType) ? req.body.fuelType : "Diesel",
      modelYear: req.body.modelYear ? Number(req.body.modelYear) : null,
      available: parseBoolean(req.body.available, true),
      photos: uploaded(req, "photos").map(f => fileRecord(f, "photo")),
      documents: uploaded(req, "documents").map(f => fileRecord(f, "document"))
    });
    res.status(201).json({ message: "Vehicle created.", data: vehicle });
  } catch (e) { cleanupFiles(req); next(e); }
}

export async function updateVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: userId(req) });
    if (!vehicle) { cleanupFiles(req); return res.status(404).json({ message: "Vehicle not found." }); }
    const allowed = ["name", "number", "type", "capacity", "capacityUnit", "fuelType", "modelYear", "available"];
    for (const key of allowed) {
      if (req.body[key] === undefined) continue;
      if (key === "number") vehicle.number = String(req.body.number).trim().toUpperCase();
      else if (key === "capacity" || key === "modelYear") vehicle[key] = req.body[key] === "" ? null : Number(req.body[key]);
      else if (key === "available") vehicle.available = parseBoolean(req.body.available, vehicle.available);
      else vehicle[key] = req.body[key];
    }
    const duplicate = await Vehicle.exists({ owner: userId(req), number: vehicle.number, _id: { $ne: vehicle._id } });
    if (duplicate) { cleanupFiles(req); return res.status(409).json({ message: "This registration number already exists." }); }
    vehicle.photos.push(...uploaded(req, "photos").map(f => fileRecord(f, "photo")));
    vehicle.documents.push(...uploaded(req, "documents").map(f => fileRecord(f, "document")));
    await vehicle.save();
    res.json({ message: "Vehicle updated.", data: vehicle });
  } catch (e) { cleanupFiles(req); next(e); }
}

export async function deleteVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: userId(req) });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    res.json({ message: "Vehicle deleted." });
  } catch (e) { next(e); }
}

export async function removeVehicleFile(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: userId(req) });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    const file = [...vehicle.photos, ...vehicle.documents].find(f => String(f._id) === req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found." });
    const folder = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads", "vehicles");
    const filePath = path.join(folder, path.basename(file.filename));
    try { fs.unlinkSync(filePath); } catch {}
    vehicle.photos = vehicle.photos.filter(f => String(f._id) !== req.params.fileId);
    vehicle.documents = vehicle.documents.filter(f => String(f._id) !== req.params.fileId);
    await vehicle.save();
    res.json({ message: "Vehicle file removed.", data: vehicle });
  } catch (e) { next(e); }
}
