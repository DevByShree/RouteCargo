const express = require("express");
const router = express.Router();


const { createShipment } = require("../controllers/shipmentController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, createShipment);

module.exports = router;
