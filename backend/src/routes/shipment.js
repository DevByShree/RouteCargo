const express = require("express");
const router = express.Router();


const { createShipment } = require("../controllers/shipmentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("customer"), createShipment);

module.exports = router;
