const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { createPaymentIntent } = require('../controllers/payment.controller');

router.use(verifyJWT);

router.post('/create-intent', createPaymentIntent);

module.exports = router;
