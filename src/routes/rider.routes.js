const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { createRider, getAvailableRiders, getAllRiders, deleteRider, toggleAvailability, getRiderLocation } = require('../controllers/rider.controller');

router.use(verifyJWT);

// Rider's own actions
router.patch('/toggle-status', authorizeRoles('rider'), toggleAvailability);
router.get('/:id/location', getRiderLocation);

// Admin actions
router.post('/create', authorizeRoles('admin'), createRider);
router.get('/available', authorizeRoles('admin'), getAvailableRiders);
router.get('/all', authorizeRoles('admin'), getAllRiders);
router.delete('/:id', authorizeRoles('admin'), deleteRider);

module.exports = router;
