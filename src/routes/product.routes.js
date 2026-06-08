const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/multer.middleware');
const { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/product.controller');

// Public can view products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.use(verifyJWT);

// Only vendors and admins can manage products
router.post('/', authorizeRoles('vendor', 'admin'), upload.single('image'), addProduct);
router.patch('/:id', authorizeRoles('vendor', 'admin'), upload.single('image'), updateProduct);
router.delete('/:id', authorizeRoles('vendor', 'admin'), deleteProduct);

module.exports = router;
