const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", authenticate, authController.me);
router.post("/signout", authenticate, authController.signout);
router.put("/me", authenticate, authController.updateMe);

// Driver-only example route (placeholder for future driver UI)
router.get(
    "/driver-only",
    authenticate,
    authorize("driver"),
    (req, res) => {
        res.json({ success: true, message: "Driver area accessible" });
    }
);

module.exports = router;
