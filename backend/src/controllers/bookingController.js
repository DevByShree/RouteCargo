const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const CapacityPost = require("../models/CapacityPost");
const DriverProfile = require("../models/DriverProfile");
const Notification = require("../models/Notification");
const Parcel = require("../models/Parcel");
const Shipment = require("../models/Shipment");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const TrackingLocation = require("../models/TrackingLocation");
const routeKey = require("../utils/routeKey");
const { emitNotification, emitBookingStatus, emitTrackingLocation } = require("../realtime/notificationHub");

const validId = (id) => mongoose.isValidObjectId(id);
const dayStart = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};
const normalizeUnit = (unit) => String(unit || "kg").toLowerCase().replace(/s$/, "");

function capacityToKg(value, unit) {
  const amount = Number(value);
  if (normalizeUnit(unit) === "ton") return amount * 1000;
  if (normalizeUnit(unit) === "kg") return amount;
  return 0;
}

async function notify(userId, type, title, message, bookingId, session) {
  const notification = { userId, type, title, message, bookingId };
  const [created] = await Notification.create([notification], { session });
  return created;
}

const customerVisibleDriverStatuses = new Set(["accepted", "in_transit", "delivered", "completed"]);

async function attachCustomerDetails(bookings, customerId) {
  if (!bookings.length) return bookings;
  const shipmentIds = [...new Set(bookings.map(item => item.shipmentId).filter(Number.isSafeInteger))];
  const parcels = shipmentIds.length
    ? await Parcel.find({ userId: customerId, shipmentId: { $in: shipmentIds } }).select("shipmentId parcelType weightKg numberOfPackages").lean()
    : [];
  const parcelsByShipment = new Map();
  for (const parcel of parcels) {
    const list = parcelsByShipment.get(parcel.shipmentId) || [];
    list.push(parcel);
    parcelsByShipment.set(parcel.shipmentId, list);
  }
  return bookings.map(booking => {
    const visible = customerVisibleDriverStatuses.has(booking.status);
    const cargo = parcelsByShipment.get(booking.shipmentId) || [];
    return {
      ...booking,
      driverId: visible ? booking.driverId : null,
      driverProfileId: visible ? booking.driverProfileId : null,
      vehicleId: visible ? booking.vehicleId : null,
      cargoType: [...new Set(cargo.map(parcel => parcel.parcelType).filter(Boolean))].join(", "),
      cargoWeightKg: cargo.reduce((total, parcel) => total + (Number(parcel.weightKg) || 0), 0),
    };
  });
}

async function ownedShipment(req, res) {
  const shipmentId = Number(req.body.shipmentId || req.query.shipmentId);
  if (!Number.isSafeInteger(shipmentId) || shipmentId < 1) {
    res.status(400).json({ success: false, message: "A valid shipmentId is required" });
    return null;
  }
  const shipment = await Shipment.findOne({ shipmentid: shipmentId, userId: req.user.id });
  if (!shipment) {
    res.status(404).json({ success: false, message: "Shipment not found for this account" });
    return null;
  }
  return shipment;
}

async function createBookingRequest(req, res) {
  const availabilityId = req.body.availabilityId || req.body.capacityId;
  if (!validId(availabilityId)) {
    return res.status(400).json({ success: false, message: "A valid availabilityId is required" });
  }

  const shipment = await ownedShipment(req, res);
  if (!shipment) return;
  const parcels = await Parcel.find({ shipmentId: shipment.shipmentid, userId: req.user.id }).select("weightKg").lean();
  const requestedCapacityKg = parcels.reduce((sum, parcel) => sum + (Number(parcel.weightKg) || 0), 0);
  if (requestedCapacityKg <= 0) {
    return res.status(400).json({ success: false, message: "Add the shipment parcel weight before booking a truck" });
  }

  const routeFrom = routeKey(shipment.pickup);
  const routeTo = routeKey(shipment.destination);
  const pickupDay = shipment.pickupDate ? dayStart(shipment.pickupDate) : dayStart(new Date());
  const session = await mongoose.startSession();
  try {
    let booking;
    let notification;
    await session.withTransaction(async () => {
      const post = await CapacityPost.findOne({
        _id: availabilityId,
        status: { $in: ["available", "booking_requested"] },
        date: { $gte: pickupDay, $lt: new Date(pickupDay.getTime() + 24 * 60 * 60 * 1000) },
      }).session(session);
      if (!post || routeKey(post.from) !== routeFrom || routeKey(post.to) !== routeTo) {
        const error = new Error("Truck availability does not match this shipment route and pickup date");
        error.status = 409;
        throw error;
      }

      const vehicle = await Vehicle.findOne({ _id: post.vehicleId, driverId: post.driverId, available: true })
        .select("name number type capacity capacityUnit photos driverProfileId")
        .session(session);
      const driverProfile = await DriverProfile.findOne({ userId: post.driverId, isActive: { $ne: false } })
        .select("ownerName companyName verificationStatus")
        .session(session);
      if (!vehicle || !driverProfile || driverProfile.verificationStatus === "rejected") {
        const error = new Error("This driver or vehicle is not eligible for booking");
        error.status = 409;
        throw error;
      }

      const availableCapacityKg = post.availableCapacityKg ?? capacityToKg(post.availableCapacity, post.capacityUnit);
      if (post.availableCapacityKg == null) {
        post.initialCapacityKg = post.initialCapacityKg || availableCapacityKg;
        post.availableCapacityKg = availableCapacityKg;
        await post.save({ session });
      }
      const reserved = await CapacityPost.findOneAndUpdate(
        { _id: post._id, status: { $in: ["available", "booking_requested"] }, availableCapacityKg: { $gte: requestedCapacityKg } },
        { $inc: { availableCapacityKg: -requestedCapacityKg } },
        { new: true, session }
      );
      if (!reserved || availableCapacityKg < requestedCapacityKg) {
        const error = new Error("Not enough truck capacity remains for this shipment");
        error.status = 409;
        throw error;
      }
      if (reserved.availableCapacityKg <= 0) {
        await CapacityPost.updateOne({ _id: reserved._id }, { $set: { status: "booked" } }, { session });
      }

      const initialKg = post.initialCapacityKg || capacityToKg(post.availableCapacity, post.capacityUnit);
      const amount = post.price == null || !initialKg ? 0 : Math.round(Number(post.price) * requestedCapacityKg / initialKg);
      [booking] = await Booking.create([{
        customerId: req.user.id,
        driverId: post.driverId,
        driverProfileId: driverProfile._id,
        vehicleId: vehicle._id,
        availabilityId: post._id,
        shipmentRef: shipment._id,
        shipmentId: shipment.shipmentid,
        requestedCapacityKg,
        amount,
        status: "pending",
      }], { session });
      notification = await notify(post.driverId, "booking.requested", "New Booking Request", `A customer requested your truck for a shipment from ${shipment.pickup} to ${shipment.destination}. Please review and respond.`, booking._id, session);
    });
    emitNotification(notification);
    return res.status(201).json({ success: true, message: "Booking request sent", data: booking });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "You already requested this truck for this shipment" });
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    throw error;
  } finally {
    await session.endSession();
  }
}

async function listCustomerBookings(req, res) {
  const bookings = await Booking.find({ customerId: req.user.id })
    .populate("shipmentRef", "pickup destination pickupDate shipmentid")
    .populate("driverId", "name email phone company profilePhoto")
    .populate("driverProfileId", "ownerName companyName verificationStatus")
    .populate("vehicleId", "name number type modelYear capacity capacityUnit photos")
    .sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: await attachCustomerDetails(bookings, req.user.id) });
}

async function listDriverBookings(req, res) {
  const bookings = await Booking.find({ driverId: req.user.id })
    .populate("shipmentRef", "pickup destination pickupDate shipmentid")
    .populate("customerId", "name email phone")
    .populate("vehicleId", "name number type capacity capacityUnit")
    .sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: bookings });
}

async function getBooking(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const booking = await Booking.findOne({ _id: req.params.id, $or: [{ customerId: req.user.id }, { driverId: req.user.id }] })
    .populate("shipmentRef", "pickup destination pickupDate shipmentid")
    .populate("driverId", "name email phone company profilePhoto")
    .populate("customerId", "name email phone")
    .populate("vehicleId", "name number type modelYear capacity capacityUnit photos").lean();
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  if (req.user.role === "customer") {
    const [details] = await attachCustomerDetails([booking], req.user.id);
    return res.json({ success: true, data: details });
  }
  return res.json({ success: true, data: booking });
}

async function decideBooking(req, res, decision) {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const session = await mongoose.startSession();
  try {
    let updated;
    let notification;
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({ _id: req.params.id, driverId: req.user.id, status: "pending" }).session(session);
      if (!booking) {
        const error = new Error("Pending booking request not found");
        error.status = 404;
        throw error;
      }
      if (decision === "rejected") {
        const availability = await CapacityPost.findOneAndUpdate(
          { _id: booking.availabilityId, driverId: req.user.id },
          { $inc: { availableCapacityKg: booking.requestedCapacityKg }, $set: { status: "available" } },
          { new: true, session }
        );
        if (!availability) throw new Error("Linked availability was not found; reservation was not released");
      }
      booking.status = decision;
      await booking.save({ session });
      updated = booking;
      const [shipment, vehicle, driver] = await Promise.all([
        Shipment.findById(booking.shipmentRef).select("pickup destination").session(session).lean(),
        Vehicle.findById(booking.vehicleId).select("number").session(session).lean(),
        User.findById(req.user.id).select("name").session(session).lean(),
      ]);
      const route = shipment ? `${shipment.pickup} to ${shipment.destination}` : "your shipment";
      const message = decision === "accepted"
        ? `Your truck booking from ${route} has been accepted by ${driver?.name || "the driver"}${vehicle?.number ? `. Truck ${vehicle.number}.` : "."}`
        : `Unfortunately, your truck booking from ${route} was rejected. You can find another available truck.`;
      notification = await notify(booking.customerId, `booking.${decision}`, decision === "accepted" ? "Your Ride is Confirmed" : "Booking Update", message, booking._id, session);
    });
    emitNotification(notification);
    emitBookingStatus(updated);
    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    throw error;
  } finally {
    await session.endSession();
  }
}

async function acceptBooking(req, res) { return decideBooking(req, res, "accepted"); }
async function rejectBooking(req, res) { return decideBooking(req, res, "rejected"); }

async function updateDriverBookingStatus(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const nextStatus = req.body.status;
  if (!["in_transit", "delivered"].includes(nextStatus)) return res.status(400).json({ success: false, message: "Status must be in_transit or delivered" });
  const allowedFrom = nextStatus === "in_transit" ? "accepted" : "in_transit";
  const session = await mongoose.startSession();
  try {
    let booking;
    let notification;
    await session.withTransaction(async () => {
      booking = await Booking.findOneAndUpdate(
        { _id: req.params.id, driverId: req.user.id, status: allowedFrom },
        { $set: { status: nextStatus } },
        { new: true, session }
      );
      if (!booking) {
        const error = new Error(`Only ${allowedFrom} bookings can move to ${nextStatus}`);
        error.status = 409;
        throw error;
      }
      if (nextStatus === "delivered") await CapacityPost.updateOne({ _id: booking.availabilityId, driverId: req.user.id }, { $set: { status: "completed" } }, { session });
      const shipment = await Shipment.findById(booking.shipmentRef).select("pickup destination").session(session).lean();
      notification = await notify(booking.customerId, `booking.${nextStatus}`, nextStatus === "delivered" ? "Delivery completed" : "Shipment in transit", `Your booking from ${shipment?.pickup || "pickup"} to ${shipment?.destination || "destination"} is now ${nextStatus.replace("_", " ")}.`, booking._id, session);
    });
    emitNotification(notification);
    emitBookingStatus(booking);
    return res.json({ success: true, data: booking });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    throw error;
  } finally {
    await session.endSession();
  }
}

function publicLocation(location) {
  if (!location) return null;
  return {
    bookingId: String(location.bookingId),
    latitude: location.latitude,
    longitude: location.longitude,
    accuracyMeters: location.accuracyMeters,
    recordedAt: location.recordedAt,
  };
}

async function getTrackingLocation(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const booking = await Booking.findOne({
    _id: req.params.id,
    $or: [{ customerId: req.user.id }, { driverId: req.user.id }],
  }).select("_id").lean();
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  const location = await TrackingLocation.findOne({ bookingId: booking._id }).lean();
  return res.json({ success: true, data: publicLocation(location) });
}

async function updateTrackingLocation(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const { latitude, longitude, accuracy } = req.body || {};
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || !Number.isFinite(longitude) || longitude < -180 || longitude > 180
    || (accuracy != null && (!Number.isFinite(accuracy) || accuracy < 0))) {
    return res.status(400).json({ success: false, message: "Valid GPS coordinates and accuracy are required" });
  }
  const booking = await Booking.findOne({ _id: req.params.id, driverId: req.user.id, status: "in_transit" })
    .select("_id customerId driverId")
    .lean();
  if (!booking) return res.status(409).json({ success: false, message: "Only the assigned driver can share GPS while this booking is in transit" });

  const recordedAt = new Date();
  const location = await TrackingLocation.findOneAndUpdate(
    { bookingId: booking._id },
    { $set: {
      bookingId: booking._id,
      customerId: booking.customerId,
      driverId: booking.driverId,
      latitude,
      longitude,
      accuracyMeters: accuracy ?? null,
      recordedAt,
    } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
  const payload = publicLocation(location);
  emitTrackingLocation({ ...location, bookingId: booking._id, customerId: booking.customerId });
  return res.json({ success: true, data: payload });
}

async function cancelBooking(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
  const session = await mongoose.startSession();
  try {
    let updated;
    let notification;
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user.id, status: "pending" }).session(session);
      if (!booking) {
        const error = new Error("Pending booking not found");
        error.status = 404;
        throw error;
      }
      const availability = await CapacityPost.findOneAndUpdate(
        { _id: booking.availabilityId, driverId: booking.driverId },
        { $inc: { availableCapacityKg: booking.requestedCapacityKg }, $set: { status: "available" } },
        { new: true, session }
      );
      if (!availability) throw new Error("Linked availability was not found; reservation was not released");
      booking.status = "cancelled";
      await booking.save({ session });
      updated = booking;
      notification = await notify(booking.driverId, "booking.cancelled", "Booking Cancelled", "A customer cancelled a pending truck booking.", booking._id, session);
    });
    emitNotification(notification);
    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = { createBookingRequest, listCustomerBookings, listDriverBookings, getBooking, acceptBooking, rejectBooking, cancelBooking, updateDriverBookingStatus, getTrackingLocation, updateTrackingLocation };
