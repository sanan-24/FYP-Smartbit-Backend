const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { 
    createIngredient, 
    getAllIngredients, 
    linkIngredientsToProduct, 
    getProductIngredients 
} = require('../controllers/ingredient.controller');

router.get('/:productId', getProductIngredients);

router.use(verifyJWT);

// Admin/Vendor can manage ingredients
router.post('/', authorizeRoles('admin', 'vendor'), createIngredient);
router.get('/', getAllIngredients);
router.post('/:productId/link', authorizeRoles('admin', 'vendor'), linkIngredientsToProduct);

module.exports = router;
