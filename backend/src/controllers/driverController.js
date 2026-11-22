const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Profile = require('../models/DriverProfile');
const Vehicle = require('../models/Vehicle');
const Request = require('../models/CargoRequest');
const Capacity = require('../models/CapacityPost');
const Shipment = require('../models/Shipment');
const Parcel = require('../models/Parcel');
const Booking = require('../models/Booking');
const routeKey = require('../utils/routeKey');

const ok = (res, data, status = 200, message) => res.status(status).json({ success: true, ...(message ? { message } : {}), data });
const valid = id => mongoose.isValidObjectId(id);
const capacityToKg = (value, unit) => /^(ton|tons)$/i.test(String(unit || '')) ? Number(value) * 1000 : /^(kg|kgs)$/i.test(String(unit || '')) ? Number(value) : 0;
const normalized = value => String(value || '').trim().toLocaleLowerCase('en-IN');
const AVAILABILITY_TIME_ZONE = 'Asia/Kolkata';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function indiaCalendarParts(value) {
    const dateOnly = typeof value === 'string' && DATE_ONLY_PATTERN.exec(value);
    if (dateOnly) {
        const [, year, month, day] = dateOnly.map(Number);
        const check = new Date(Date.UTC(year, month - 1, day));
        if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
        return { year, month, day };
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: AVAILABILITY_TIME_ZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date);
    const result = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
    return { year: result.year, month: result.month, day: result.day };
}

function indiaDayBounds(value) {
    const parts = indiaCalendarParts(value);
    if (!parts) return null;
    // India has no daylight-saving transitions; this is midnight IST expressed as UTC.
    const start = new Date(Date.UTC(parts.year, parts.month - 1, parts.day) - (5 * 60 + 30) * 60 * 1000);
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function matchesCargoType(acceptedTypes, requestedType) {
    const requested = normalized(requestedType);
    if (!requested) return true;
    const accepted = (acceptedTypes || []).map(normalized);
    return accepted.includes('general cargo') || accepted.includes(requested);
}

function availabilityExclusion(post, { from, to, requiredCapacityKg = 0, cargoType = '' }) {
    if (!post.vehicleId || !post.driverId) return 'association';
    if (routeKey(post.from) !== routeKey(from) || routeKey(post.to) !== routeKey(to)) return 'route';
    if (!matchesCargoType(post.loadTypes, cargoType)) return 'cargoType';
    const remainingKg = post.availableCapacityKg ?? capacityToKg(post.availableCapacity, post.capacityUnit);
    if (remainingKg <= 0 || remainingKg < requiredCapacityKg) return 'capacity';
    return null;
}

const fileInfo = (f, vehicleId) => {
    const category = f.fieldname === 'photos' ? 'photos' : 'documents';
    const url = category === 'photos' ? `/uploads/vehicles/photos/${f.filename}` : `/api/driver/vehicles/${vehicleId}/documents/${encodeURIComponent(f.filename)}`;
    return { url, originalName: f.originalname, mimeType: f.mimetype, size: f.size };
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

    const profile = await Profile.findOne({ userId: req.user.id, isActive: { $ne: false } });
    if (!profile) return res.status(409).json({ success: false, message: 'Complete an active driver profile before adding a vehicle' });
    const registrationNumber = String(number).trim().toUpperCase();
    if (await Vehicle.exists({ number: registrationNumber })) return res.status(409).json({ success: false, message: 'This vehicle registration number is already registered' });

    const v = await Vehicle.create({
        ...req.body, driverId: req.user.id, driverProfileId: profile._id, number: registrationNumber, capacity: Number(capacity),
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

    const keys = ['name', 'number', 'type', 'capacity', 'capacityUnit', 'fuelType', 'modelYear', 'available', 'dimensions', 'volumeCapacityM3', 'axles'];
    const data = {};

    keys.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k] });

    if (data.capacity !== undefined)
        data.capacity = Number(data.capacity);

    if (data.modelYear === '')
        data.modelYear = null;

    if (data.available !== undefined)
        data.available = data.available === true || data.available === 'true';

    if (data.number !== undefined) {
        data.number = String(data.number).trim().toUpperCase();
        if (await Vehicle.exists({ number: data.number, _id: { $ne: req.params.id } }))
            return res.status(409).json({ success: false, message: 'This vehicle registration number is already registered' });
    }

    const v = await Vehicle.findOneAndUpdate({ _id: req.params.id, driverId: req.user.id }, { $set: data }, { new: true, runValidators: true });

    if (!v)
        return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
        });

    return ok(res, v, 200, 'Vehicle updated');
};

exports.deleteVehicle = async (req, res) => {
    if (!valid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const v = await Vehicle.findOneAndUpdate({ _id: req.params.id, driverId: req.user.id }, { $set: { available: false } }, { new: true });
    if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    await Capacity.updateMany({ vehicleId: v._id, driverId: req.user.id, status: { $in: ['available', 'booking_requested'] } }, { $set: { status: 'cancelled' } });
    return ok(res, { id: v._id, available: false }, 200, 'Vehicle deactivated');
};

exports.uploadFiles = async (req, res) => {
    if (!valid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const v = await Vehicle.findOne({ _id: req.params.id, driverId: req.user.id });
    if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    v.photos.push(...(req.files?.photos || []).map(file => fileInfo(file, v._id)));
    v.documents.push(...(req.files?.documents || []).map(file => fileInfo(file, v._id)));
    await v.save();
    return ok(res, v, 200, 'Files uploaded');
};

exports.getVehicleDocument = async (req, res) => {
    if (!valid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const vehicle = await Vehicle.findOne({ _id: req.params.id, driverId: req.user.id }).select('documents');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const fileName = path.basename(req.params.fileName);
    if (!vehicle.documents.some(item => path.basename(item.url) === fileName)) return res.status(404).json({ success: false, message: 'Vehicle document not found' });
    const privateRoot = path.resolve(__dirname, '../../uploads/vehicles/documents');
    const privatePath = path.resolve(privateRoot, fileName);
    if (!privatePath.startsWith(`${privateRoot}${path.sep}`)) return res.status(400).json({ success: false, message: 'Invalid document path' });
    return res.sendFile(privatePath);
};

exports.removeVehicleFile = async (req, res) => {
    if (!valid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const vehicle = await Vehicle.findOne({ _id: req.params.id, driverId: req.user.id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const fileName = path.basename(req.params.fileName);
    const file = [...vehicle.photos, ...vehicle.documents].find(item => path.basename(item.url) === fileName);
    if (!file) return res.status(404).json({ success: false, message: 'Vehicle file not found' });
    const category = vehicle.photos.some(item => path.basename(item.url) === fileName) ? 'photos' : 'documents';
    const uploadRoot = path.resolve(__dirname, '../../uploads/vehicles', category);
    const storedPath = path.resolve(uploadRoot, path.basename(file.url));
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

exports.listCapacity = async (req, res) => ok(res, await Capacity.find({ driverId: req.user.id }).populate('vehicleId', '-documents').sort({ createdAt: -1 }));

exports.listPublicCapacity = async (req, res) => {
    let { from, to, date, type, cargoType, minPrice, maxPrice, sort = 'best' } = req.query;
    let requiredCapacityKg = Math.max(0, Number(req.query.requiredCapacityKg) || 0);
    if (req.query.shipmentId) {
        const shipmentId = Number(req.query.shipmentId);
        if (!Number.isSafeInteger(shipmentId) || shipmentId < 1) return res.status(400).json({ success: false, message: 'Invalid shipment ID' });
        const shipment = await Shipment.findOne({ shipmentid: shipmentId, userId: req.user.id });
        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
        from = shipment.pickup;
        to = shipment.destination;
        date = shipment.pickupDate || date;
        const parcels = await Parcel.find({ shipmentId, userId: req.user.id }).select('weightKg').lean();
        requiredCapacityKg = parcels.reduce((sum, parcel) => sum + (Number(parcel.weightKg) || 0), 0);
    }
    if (!String(from || '').trim() || !String(to || '').trim()) return res.status(400).json({ success: false, message: 'Pickup and destination are required' });
    const dayBounds = indiaDayBounds(date || new Date());
    if (!dayBounds) return res.status(400).json({ success: false, message: 'Invalid pickup date' });
    const activeStatusFilter = { status: { $in: ['available', 'booking_requested'] } };
    const dateFilter = { ...activeStatusFilter, date: { $gte: dayBounds.start, $lt: dayBounds.end } };
    const [activePostCount, posts] = await Promise.all([
        Capacity.countDocuments(activeStatusFilter),
        Capacity.find(dateFilter)
        .populate({ path: 'vehicleId', match: { available: true }, select: 'name type capacity capacityUnit photos' })
        .populate({ path: 'driverId', match: { role: 'driver' }, select: 'name' })
        .sort({ date: 1, createdAt: -1 }).lean(),
    ]);
    const profiles = await Profile.find({ userId: { $in: posts.filter(p => p.vehicleId && p.driverId).map(p => p.driverId._id) }, isActive: { $ne: false }, verificationStatus: { $ne: 'rejected' } })
        .select('userId ownerName companyName verificationStatus').lean();
    const profileByUser = new Map(profiles.map(profile => [String(profile.userId), profile]));
    const exclusions = { date: Math.max(0, activePostCount - posts.length), association: 0, profile: 0, route: 0, cargoType: 0, vehicleType: 0, capacity: 0, price: 0 };
    const results = posts.filter(post => {
        const exclusion = availabilityExclusion(post, { from, to, requiredCapacityKg, cargoType });
        if (exclusion) { exclusions[exclusion] += 1; return false; }
        const profile = profileByUser.get(String(post.driverId._id));
        if (!profile) { exclusions.profile += 1; return false; }
        if (type && !normalized(post.vehicleId.type).includes(normalized(type))) { exclusions.vehicleType += 1; return false; }
        if (minPrice != null && (post.price == null || post.price < Number(minPrice))) { exclusions.price += 1; return false; }
        if (maxPrice != null && (post.price == null || post.price > Number(maxPrice))) { exclusions.price += 1; return false; }
        return true;
    }).map(post => {
        const profile = profileByUser.get(String(post.driverId._id));
        return {
            _id: post._id,
            availabilityId: post._id,
            from: post.from,
            to: post.to,
            date: post.date,
            expectedArrivalDate: post.expectedArrivalDate,
            intermediateStops: post.intermediateStops || [],
            availableCapacityKg: post.availableCapacityKg ?? capacityToKg(post.availableCapacity, post.capacityUnit),
            price: post.price,
            priceType: post.priceType,
            notes: post.notes,
            status: post.status,
            vehicle: post.vehicleId,
            photos: post.vehicleId.photos || [],
            driver: { id: post.driverId._id, name: profile.companyName || profile.ownerName || post.driverId.name, verificationStatus: profile.verificationStatus },
        };
    });
    results.sort((a, b) => sort === 'price' ? (a.price ?? Infinity) - (b.price ?? Infinity) : new Date(a.date) - new Date(b.date));
    console.info('[availability-search]', {
        requestedDate: `${indiaCalendarParts(dayBounds.start).year}-${String(indiaCalendarParts(dayBounds.start).month).padStart(2, '0')}-${String(indiaCalendarParts(dayBounds.start).day).padStart(2, '0')}`,
        requiredCapacityKg,
        cargoType: cargoType || null,
        considered: activePostCount,
        matched: results.length,
        excluded: exclusions,
    });
    return ok(res, results);
};

exports.createCapacity = async (req, res) => {
    const vehicleId = req.body.vehicleId || req.body.truckId;
    const { availableCapacity, date, from, to } = req.body;
    if (!vehicleId || availableCapacity == null || !date || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, availableCapacity, date, from, and to are required' });
    if (!valid(vehicleId)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const v = await Vehicle.findOne({ _id: vehicleId, driverId: req.user.id, available: true });
    if (!v) return res.status(404).json({ success: false, message: 'Active vehicle not found' });
    const profile = await Profile.findOne({ userId: req.user.id, isActive: { $ne: false } });
    if (!profile || profile.verificationStatus === 'rejected') return res.status(403).json({ success: false, message: 'An eligible driver profile is required to publish availability' });
    const cap = Number(availableCapacity);
    const capacityUnit = req.body.capacityUnit || v.capacityUnit;
    const availableCapacityKg = capacityToKg(cap, capacityUnit);
    const maxCapacityKg = capacityToKg(v.capacity, v.capacityUnit);
    const dateBounds = indiaDayBounds(date);
    if (!Number.isFinite(cap) || cap <= 0 || availableCapacityKg <= 0 || availableCapacityKg > maxCapacityKg) return res.status(400).json({ success: false, message: 'Available load must be positive and within the vehicle weight capacity' });
    const todayBounds = indiaDayBounds(new Date());
    if (!dateBounds || dateBounds.start < todayBounds.start) return res.status(400).json({ success: false, message: 'Availability date must be today or later' });
    const price = req.body.price == null || req.body.price === '' ? null : Number(req.body.price);
    if (price != null && (!Number.isFinite(price) || price < 0)) return res.status(400).json({ success: false, message: 'Price must be a non-negative amount' });
    const p = await Capacity.create({
        driverId: req.user.id, vehicleId, vehicleName: v.name, vehicleNumber: v.number,
        availableCapacity: cap, initialCapacityKg: availableCapacityKg, availableCapacityKg, capacityUnit, date: dateBounds.start,
        from: String(from).trim(), to: String(to).trim(),
        intermediateStops: Array.isArray(req.body.intermediateStops) ? req.body.intermediateStops.map(x => String(x).trim()).filter(Boolean).slice(0, 20) : [],
        expectedArrivalDate: req.body.expectedArrivalDate ? indiaDayBounds(req.body.expectedArrivalDate)?.start || null : null, price, priceType: req.body.priceType === 'fixed' ? 'fixed' : 'negotiable',
        loadTypes: Array.isArray(req.body.loadTypes) ? req.body.loadTypes : (req.body.loadTypes ? [req.body.loadTypes] : []),
        companyName: req.body.companyName || profile.companyName || '', contactNumber: req.body.contactPhone || req.body.contactNumber || profile.contactNumber || '', notes: req.body.notes || '',
    });
    return ok(res, p, 201, 'Availability published');
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

    if (await Booking.exists({ availabilityId: p._id, status: { $nin: ['rejected', 'cancelled'] } }))
        return res.status(409).json({ success: false, message: 'Availability cannot be edited after a customer has requested it' });

    const body = req.body || {};
    const vehicleId = body.vehicleId || p.vehicleId;
    if (!valid(vehicleId)) return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    const vehicle = await Vehicle.findOne({ _id: vehicleId, driverId: req.user.id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found for this driver' });
    const changingVehicle = String(vehicle._id) !== String(p.vehicleId);
    if (changingVehicle && !vehicle.available)
        return res.status(409).json({ success: false, message: 'Select an active vehicle to change this availability' });

    const from = body.from === undefined ? p.from : String(body.from).trim();
    const to = body.to === undefined ? p.to : String(body.to).trim();
    if (!from || !to || from.length > 160 || to.length > 160)
        return res.status(400).json({ success: false, message: 'Pickup and destination are required and must be 160 characters or fewer' });

    let date = p.date;
    if (body.date !== undefined) {
        const bounds = indiaDayBounds(body.date);
        const today = indiaDayBounds(new Date());
        if (!bounds || bounds.start < today.start)
            return res.status(400).json({ success: false, message: 'Availability date must be today or later' });
        date = bounds.start;
    }

    const allowedLoadTypes = new Set(['Small goods', 'Industrial goods', 'Fragile goods', 'General cargo']);
    let loadTypes = p.loadTypes || [];
    if (body.loadTypes !== undefined) {
        loadTypes = Array.isArray(body.loadTypes) ? body.loadTypes : [body.loadTypes];
        loadTypes = [...new Set(loadTypes.map(value => String(value).trim()).filter(Boolean))];
        if (!loadTypes.length || loadTypes.some(value => !allowedLoadTypes.has(value)))
            return res.status(400).json({ success: false, message: 'Select at least one supported cargo type' });
    }

    let price = p.price;
    if (body.price !== undefined) {
        price = body.price === null || body.price === '' ? null : Number(body.price);
        if (price !== null && (!Number.isFinite(price) || price < 0))
            return res.status(400).json({ success: false, message: 'Price must be a non-negative amount' });
    }
    let priceType = p.priceType;
    if (body.priceType !== undefined) {
        if (!['fixed', 'negotiable'].includes(body.priceType))
            return res.status(400).json({ success: false, message: 'Price type must be fixed or negotiable' });
        priceType = body.priceType;
    }

    let availableCapacityKg;
    let availableCapacity = p.availableCapacity;
    let capacityUnit = p.capacityUnit || vehicle.capacityUnit;
    if (body.availableCapacityKg !== undefined) {
        availableCapacityKg = Number(body.availableCapacityKg);
        availableCapacity = availableCapacityKg;
        capacityUnit = 'kg';
    } else if (body.availableCapacity !== undefined) {
        availableCapacity = Number(body.availableCapacity);
        capacityUnit = body.capacityUnit || capacityUnit;
        availableCapacityKg = capacityToKg(availableCapacity, capacityUnit);
    } else {
        availableCapacityKg = p.availableCapacityKg ?? capacityToKg(availableCapacity, capacityUnit);
    }
    const vehicleCapacityKg = capacityToKg(vehicle.capacity, vehicle.capacityUnit);
    if (!Number.isFinite(availableCapacityKg) || availableCapacityKg <= 0 || !vehicleCapacityKg || availableCapacityKg > vehicleCapacityKg)
        return res.status(400).json({ success: false, message: 'Available capacity must be positive and within the selected vehicle capacity' });

    p.vehicleId = vehicle._id;
    p.vehicleName = vehicle.name;
    p.vehicleNumber = vehicle.number;
    p.availableCapacity = availableCapacity;
    p.capacityUnit = capacityUnit;
    p.availableCapacityKg = availableCapacityKg;
    p.initialCapacityKg = availableCapacityKg;
    p.date = date;
    p.from = from;
    p.to = to;
    p.loadTypes = loadTypes;
    p.price = price;
    p.priceType = priceType;
    for (const key of ['companyName', 'contactNumber', 'notes']) {
        if (body[key] !== undefined) p[key] = String(body[key]).trim();
    }
    await p.save();
    return ok(res, p, 200, 'Capacity updated');
};

exports.deleteCapacity = async (req, res) => {
    if (!valid(req.params.id))
        return res.status(400).json({
            success: false,
            message: 'Invalid capacity ID'
        });

    const p = await Capacity.findOneAndUpdate({ _id: req.params.id, driverId: req.user.id, status: { $in: ['available', 'booking_requested'] } }, { $set: { status: 'cancelled' } }, { new: true });

    if (!p) return res.status(404).json({
        success: false,
        message: 'Available capacity post not found'
    });

    return ok(res, { id: p._id }, 200, 'Availability cancelled');
};
