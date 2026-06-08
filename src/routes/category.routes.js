const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/category.controller');

router.get('/', getAllCategories);

router.use(verifyJWT);

router.post('/', authorizeRoles('admin'), createCategory);
router.patch('/:id', authorizeRoles('admin'), updateCategory);
router.delete('/:id', authorizeRoles('admin'), deleteCategory);

module.exports = router;
