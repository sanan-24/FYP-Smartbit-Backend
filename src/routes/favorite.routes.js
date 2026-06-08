const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { toggleFavorite, getMyFavorites } = require('../controllers/favorite.controller');

router.use(verifyJWT);

router.route('/')
    .get(getMyFavorites)
    .post(toggleFavorite);

module.exports = router;
