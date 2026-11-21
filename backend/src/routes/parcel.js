const express = require("express");
const router = express.Router();


const { createParcel, getAllParcels } = require("../controllers/parcelControllers");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Create parcel
router.post("/", authenticate, authorize("customer"), createParcel);
// Get all parcels
router.get("/", authenticate, authorize("customer"), getAllParcels);

module.exports = router;
