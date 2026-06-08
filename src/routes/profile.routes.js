const express = require('express');
const router = express.Router();
const { updateProfile, getMyProfile } = require('../controllers/profile.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

// All profile routes are protected
router.use(verifyJWT);

router.route("/")
    .get(getMyProfile)
    .patch(upload.single("profilePhoto"), updateProfile);

module.exports = router;
