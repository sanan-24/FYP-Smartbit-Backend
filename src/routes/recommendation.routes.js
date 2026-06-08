const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { getPersonalizedRecommendations, getTrendingItems } = require('../controllers/recommendation.controller');

router.use(verifyJWT);

router.get('/personalized', getPersonalizedRecommendations);
router.get('/trending', getTrendingItems);

module.exports = router;
