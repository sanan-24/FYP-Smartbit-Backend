const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { addReview, getProductReviews, getRiderReviews } = require('../controllers/review.controller');

router.get('/product/:productId', getProductReviews);
router.get('/rider/:riderId', getRiderReviews);

router.use(verifyJWT);

router.post('/', addReview);

module.exports = router;
