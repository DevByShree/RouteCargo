const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.post('/signup', c.signup);

router.post('/signin', c.signin);

router.get('/me', authenticate, c.me);

router.post('/signout', authenticate, c.signout);

router.get('/driver-only', authenticate, authorize('driver'),
    (req, res) => res.json({
        success: true, message: 'Driver area accessible'
    }));

module.exports = router;
