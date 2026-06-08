const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const {
    getAllUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/user.controller');

// All routes here are protected and only for admin
router.use(verifyJWT);
router.use(authorizeRoles('admin'));

router.get('/', getAllUsers);
router.patch('/update-role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
