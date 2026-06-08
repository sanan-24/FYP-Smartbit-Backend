const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { getAdminDashboardStats, exportStats } = require('../controllers/dashboard.controller');

// Admin only routes
router.use(verifyJWT);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminDashboardStats);
router.get('/analytics', getAdminDashboardStats); // Both pointing to same for now as requested
router.get('/export', exportStats);

module.exports = router;
