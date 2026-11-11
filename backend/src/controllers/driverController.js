const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Profile = require('../models/DriverProfile');
const Vehicle = require('../models/Vehicle');
const Request = require('../models/CargoRequest');
const Capacity = require('../models/CapacityPost');

const ok = (res, data, status = 200, message) => res.status(status).json({ success: true, ...(message ? { message } : {}), data });
const valid = id => mongoose.isValidObjectId(id);
const fileInfo = f => {
    const category = f.fieldname === 'photos' ? 'photos' : 'documents';
    return { url: `/uploads/vehicles/${category}/${f.filename}`, originalName: f.originalname, mimeType: f.mimetype, size: f.size };
};

exports.getProfile = async (req, res) => ok(res, await Profile.findOne({ userId: req.user.id }));

exports.saveProfile = async (req, res) => {

    const keys = ['ownerName', 'contactNumber', 'email', 'altNumber', 'address', 'companyName', 'gstNumber', 'companyAddress', 'yearEstablishment'];

    const data = {}; keys.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k] });

    const current = await Profile.findOne({ userId: req.user.id }); if (!current && (!data.ownerName || !data.contactNumber))
        return res.status(400).json({
            success: false,
            message: 'ownerName and contactNumber are required'
        });

    if (data.yearEstablishment === '') data.yearEstablishment = null;

    const p = await Profile.findOneAndUpdate({ userId: req.user.id },
        { $set: data, $setOnInsert: { userId: req.user.id } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    return ok(res, p, 200, 'Profile saved');
};

exports.listVehicles = async (req, res) => ok(res, await Vehicle.find({ driverId: req.user.id }).sort({ createdAt: -1 }));

exports.createVehicle = async (req, res) => {
    const { name, number, type, capacity } = req.body;

    if (!name || !number || !type || capacity == null || !Number.isFinite(Number(capacity)) || Number(capacity) <= 0)
        return res.status(400).json({
            success: false,
            message: 'Valid name, number, type, and positive capacity are required'
        });

    const v = await Vehicle.create({
        ...req.body, driverId: req.user.id, capacity: Number(capacity),
        available: req.body.available === undefined ? true : req.body.available === true || req.body.available === 'true', modelYear: req.body.modelYear === '' ? null : req.body.modelYear
    });

    return ok(res, v, 201, 'Vehicle created');
};

exports.updateVehicle = async (req, res) => {

    if (!valid(req.params.id))
        return res.status(400).json({
            success: false,
            message: 'Invalid vehicle ID'
        });

    const keys = ['name', 'number', 'type', 'capacity', 'capacityUnit', 'fuelType', 'modelYear', 'available'];
    const data = {};

    keys.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k] });

    if (data.capacity !== undefined)
        data.capacity = Number(data.capacity);

    if (data.modelYear === '')
        data.modelYear = null;

    if (data.available !== undefined)
        data.available = data.available === true || data.available === 'true';

    const v = await Vehicle.findOneAndUpdate({ _id: req.params.id, driverId: req.user.id }, { $set: data }, { new: true, runValidators: true });

    if (!v)
        return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
        });

    return ok(res, v, 200, 'Vehicle updated');
};

exports.deleteVehicle = async (req, res) => {
    if (!valid(req.params.id))
        return res.status(400).json({ success: false, message: 'Invalid vehicle ID' }); const v = await Vehicle.findOneAndDelete({ _id: req.params.id, driverId: req.user.id }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' }); await Capacity.deleteMany({ vehicleId: v._id, driverId: req.user.id, status: 'available' }); return ok(res, { id: v._id }, 200, 'Vehicle deleted');
};

exports.uploadFiles = async (req, res) => {
    if (!valid(req.params.id))
        return res.status(400).json({ success: false, message: 'Invalid vehicle ID' }); const v = await Vehicle.findOne({ _id: req.params.id, driverId: req.user.id }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' }); v.photos.push(...(req.files?.photos || []).map(fileInfo)); v.documents.push(...(req.files?.documents || []).map(fileInfo)); await v.save(); return ok(res, v, 200, 'Files uploaded');
};

exports.removeVehicleFile = async (req, res) => {
    if (!valid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const vehicle = await Vehicle.findOne({ _id: req.params.id, driverId: req.user.id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const fileName = path.basename(req.params.fileName);
    const file = [...vehicle.photos, ...vehicle.documents].find(item => path.basename(item.url) === fileName);
    if (!file) return res.status(404).json({ success: false, message: 'Vehicle file not found' });
    const category = vehicle.photos.some(item => path.basename(item.url) === fileName) ? 'photos' : 'documents';
    const uploadRoot = path.resolve(__dirname, '../../uploads');
    const storedPath = path.resolve(uploadRoot, file.url.replace(/^\/uploads\//, ''));
    if (!storedPath.startsWith(`${uploadRoot}${path.sep}`)) return res.status(400).json({ success: false, message: 'Invalid vehicle file path' });
    try { fs.unlinkSync(storedPath); } catch {}
    if (category === 'photos') vehicle.photos = vehicle.photos.filter(item => path.basename(item.url) !== fileName);
    else vehicle.documents = vehicle.documents.filter(item => path.basename(item.url) !== fileName);
    await vehicle.save();
    return ok(res, vehicle, 200, 'Vehicle file removed');
};

exports.listRequests = async (req, res) => ok(res, await Request.find({ $or: [{ driverId: req.user.id }, { driverId: null }], status: { $nin: ['cancelled'] } }).populate('customerId', 'name email').sort({ createdAt: -1 }));

exports.updateRequest = async (req, res) => {
    if (!valid(req.params.id))
        return res.status(400).json({ success: false, message: 'Invalid request ID' }); const { status } = req.body; const transitions = { pending: ['accepted', 'rejected'], accepted: ['in_transit'], in_transit: ['completed'] }; if (!Object.values(transitions).flat().includes(status)) return res.status(400).json({ success: false, message: 'Unsupported status' }); const r = await Request.findById(req.params.id); if (!r) return res.status(404).json({ success: false, message: 'Request not found' }); if (r.driverId && String(r.driverId) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Request belongs to another driver' }); if (!(transitions[r.status] || []).includes(status)) return res.status(400).json({ success: false, message: `Cannot change ${r.status} to ${status}` }); if (status === 'accepted') r.driverId = req.user.id; r.status = status; await r.save(); return ok(res, r, 200, 'Request status updated');
};

exports.listCapacity = async (req, res) => ok(res, await Capacity.find({ driverId: req.user.id }).populate('vehicleId').sort({ createdAt: -1 }));

exports.listPublicCapacity = async (_req, res) => ok(res, await Capacity.find({ status: 'available', date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }).populate('vehicleId', 'name number type capacity capacityUnit').populate('driverId', 'name').sort({ date: 1, createdAt: -1 }).lean());

exports.createCapacity = async (req, res) => {
    const vehicleId = req.body.vehicleId || req.body.truckId; const { availableCapacity, date, from, to } = req.body; if (!vehicleId || availableCapacity == null || !date || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, availableCapacity, date, from, and to are required' }); if (!valid(vehicleId)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' }); const v = await Vehicle.findOne({ _id: vehicleId, driverId: req.user.id }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' }); const cap = Number(availableCapacity); if (!Number.isFinite(cap) || cap <= 0 || cap > v.capacity) return res.status(400).json({ success: false, message: 'Available capacity must be positive and no greater than vehicle capacity' }); const p = await Capacity.create({ driverId: req.user.id, vehicleId, vehicleName: v.name, vehicleNumber: v.number, availableCapacity: cap, capacityUnit: req.body.capacityUnit || v.capacityUnit, date, from, to, loadTypes: Array.isArray(req.body.loadTypes) ? req.body.loadTypes : (req.body.loadTypes ? [req.body.loadTypes] : []), companyName: req.body.companyName || '', contactNumber: req.body.contactPhone || req.body.contactNumber || '', notes: req.body.notes || '' }); return ok(res, p, 201, 'Capacity posted');
};

exports.updateCapacity = async (req, res) => {
    if (!valid(req.params.id))
        return res.status(400).json({ success: false, message: 'Invalid capacity ID' });

    const p = await Capacity.findOne({ _id: req.params.id, driverId: req.user.id });

    if (!p)
        return res.status(404).json({ success: false, message: 'Capacity post not found' });

    if (p.status !== 'available')
        return res.status(409).json({
            success: false, message: 'Only available posts can be edited'
        });

    ['availableCapacity', 'date', 'from', 'to', 'loadTypes', 'companyName', 'contactNumber', 'notes'].forEach(k => {
            if (req.body[k] !== undefined)
                p[k] = req.body[k]
        });

    const v = await Vehicle.findOne({ _id: p.vehicleId, driverId: req.user.id });

    if (!v || Number(p.availableCapacity) <= 0 || Number(p.availableCapacity) > v.capacity)
        return res.status(400).json({ success: false, message: 'Capacity must be positive and within vehicle capacity' });
    await p.save(); return ok(res, p, 200, 'Capacity updated');
};

exports.deleteCapacity = async (req, res) => {
    if (!valid(req.params.id))
        return res.status(400).json({
            success: false,
            message: 'Invalid capacity ID'
        });

    const p = await Capacity.findOneAndDelete({ _id: req.params.id, driverId: req.user.id, status: 'available' });

    if (!p) return res.status(404).json({
        success: false,
        message: 'Available capacity post not found'
    });

    return ok(res, { id: p._id }, 200, 'Capacity deleted');
};
