const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const {
    createOrder,
    getOrderById,
    getUserOrders,
    getRiderOrders,
    getRiderStats,
    getAllOrders,
    getUnassignedOrders,
    updateOrderStatus,
    updatePaymentStatus,
    assignRider
} = require('../controllers/order.controller');

router.use(verifyJWT);

// Customer routes
router.post('/', authorizeRoles('user'), createOrder);
router.get('/my-orders', authorizeRoles('user'), getUserOrders);

// Rider routes
router.get('/rider-orders', authorizeRoles('rider'), getRiderOrders);
router.get('/assigned', authorizeRoles('rider'), getRiderOrders);
router.get('/rider-stats', authorizeRoles('rider'), getRiderStats);

// Admin/Vendor routes
router.get('/', authorizeRoles('admin', 'vendor'), getAllOrders);
router.get('/unassigned', authorizeRoles('admin'), getUnassignedOrders);

// Static routes should be above parameterized routes
router.patch('/:id/status', authorizeRoles('admin', 'vendor', 'rider'), updateOrderStatus);
router.patch('/:id/payment', authorizeRoles('admin', 'vendor'), updatePaymentStatus);
router.patch('/:id/assign-rider', authorizeRoles('admin'), assignRider);

// General route for specific order
router.get('/:id', getOrderById);

module.exports = router;
