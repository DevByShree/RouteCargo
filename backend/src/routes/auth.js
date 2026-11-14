const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", authenticate, authController.me);
router.post("/signout", authenticate, authController.signout);
router.put("/me", authenticate, authController.updateMe);
<<<<<<< HEAD
=======
router.post('/signup', c.signup);
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657

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
