const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

<<<<<<< HEAD
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", authenticate, authController.me);
router.post("/signout", authenticate, authController.signout);
router.put("/me", authenticate, authController.updateMe);
=======
router.post('/signup', c.signup);
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543

router.post('/signin', c.signin);

router.get('/me', authenticate, c.me);

router.post('/signout', authenticate, c.signout);

router.get('/driver-only', authenticate, authorize('driver'),
    (req, res) => res.json({
        success: true, message: 'Driver area accessible'
    }));

module.exports = router;
