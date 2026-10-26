const express = require("express");
const router = express.Router();


const { createParcel, getAllParcels } = require("../controllers/parcelControllers");
const { authenticate } = require("../middleware/authMiddleware");

// Create parcel
router.post("/", authenticate, createParcel);
// Get all parcels
router.get("/", authenticate, getAllParcels);

module.exports = router;
