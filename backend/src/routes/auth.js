const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const profilePhotoUpload = require('../middleware/profilePhotoUpload');
const profilePhotoController = require('../controllers/profilePhotoController');

router.post('/signup', c.signup);

router.post('/signin', c.signin);
router.post('/refresh', c.refresh);

router.get('/me', authenticate, c.me);
router.put('/me', authenticate, c.updateMe);
router.post('/me/photo', authenticate, profilePhotoUpload.single('photo'), profilePhotoController.upload);
router.delete('/me/photo', authenticate, profilePhotoController.remove);

router.post('/signout', c.signout);

router.get('/driver-only', authenticate, authorize('driver'),
    (req, res) => res.json({
        success: true, message: 'Driver area accessible'
    }));

module.exports = router;
