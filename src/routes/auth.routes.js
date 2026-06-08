const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    forgotPasswordOTP,
    verifyOTP,
    resetPassword,
    getCurrentUser
} = require('../controllers/auth.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authRateLimiter } = require('../middlewares/rateLimit.middleware');

// Public routes
router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', authRateLimiter, forgotPasswordOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshAccessToken);

// Secured routes
router.get('/me', verifyJWT, getCurrentUser);
router.post('/logout', verifyJWT, logoutUser);

// Example role-based route
const { authorizeRoles } = require('../middlewares/role.middleware');
router.get('/admin-only', verifyJWT, authorizeRoles('admin'), (req, res) => {
    res.send("Admin content");
});

module.exports = router;
