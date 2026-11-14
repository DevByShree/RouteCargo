
const express = require("express");
const router = express.Router();

const { createBookingRequest, } = require("../controllers/bookingController");

// POST: Create booking request
router.post("/request", createBookingRequest);

module.exports = router;
