
const express = require("express");
const router = express.Router();
const c = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post("/", authenticate, authorize("customer"), wrap(c.createBookingRequest));
router.get("/my-bookings", authenticate, authorize("customer"), wrap(c.listCustomerBookings));
router.get("/driver", authenticate, authorize("driver"), wrap(c.listDriverBookings));
router.put("/:id/accept", authenticate, authorize("driver"), wrap(c.acceptBooking));
router.put("/:id/reject", authenticate, authorize("driver"), wrap(c.rejectBooking));
router.put("/:id/status", authenticate, authorize("driver"), wrap(c.updateDriverBookingStatus));
router.get("/:id/tracking", authenticate, wrap(c.getTrackingLocation));
router.post("/:id/tracking", authenticate, authorize("driver"), wrap(c.updateTrackingLocation));
router.delete("/:id", authenticate, authorize("customer"), wrap(c.cancelBooking));
router.get("/:id", authenticate, wrap(c.getBooking));

module.exports = router;
