const express = require('express');
const router = express.Router();
const { getRecommendation } = require('../controllers/ai.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

// Public or Protected depending on your need, let's keep it public for testing or use verifyJWT if needed
router.post('/suggest', getRecommendation);

module.exports = router;
