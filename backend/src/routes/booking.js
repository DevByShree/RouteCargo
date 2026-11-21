
const express = require("express");
const router = express.Router();
const { createBookingRequest, } = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("customer"), createBookingRequest);

module.exports = router;
