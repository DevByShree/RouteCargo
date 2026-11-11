const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const c = require('../controllers/driverController');
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate, authorize('driver'));

router.get('/profile', wrap(c.getProfile));
router.put('/profile', wrap(c.saveProfile));
router.get('/vehicles', wrap(c.listVehicles));
router.post('/vehicles', wrap(c.createVehicle));
router.put('/vehicles/:id', wrap(c.updateVehicle));
router.delete('/vehicles/:id', wrap(c.deleteVehicle));

router.post('/vehicles/:id/uploads', upload.fields([
    { name: 'photos', maxCount: 8 },
    { name: 'documents', maxCount: 8 }
]), wrap(c.uploadFiles));

router.get('/requests', wrap(c.listRequests));
router.patch('/requests/:id/status', wrap(c.updateRequest));
router.get('/capacity', wrap(c.listCapacity));
router.post('/capacity', wrap(c.createCapacity));
router.put('/capacity/:id', wrap(c.updateCapacity));
router.delete('/capacity/:id', wrap(c.deleteCapacity));

module.exports = router;
