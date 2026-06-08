const IngredientService = require('../services/ingredient.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');

const createIngredient = asyncHandler(async (req, res) => {
    const ingredient = await IngredientService.createIngredient(req.body);
    return res.status(201).json(
        new ApiResponse(201, ingredient, 'Ingredient created successfully')
    );
});

const getAllIngredients = asyncHandler(async (req, res) => {
    const ingredients = await IngredientService.getAllIngredients();
    return res.status(200).json(
        new ApiResponse(200, ingredients, 'Ingredients fetched successfully')
    );
});

const linkIngredientsToProduct = asyncHandler(async (req, res) => {
    const links = await IngredientService.linkIngredientsToProduct(req.params.productId, req.body.ingredients);
    return res.status(200).json(
        new ApiResponse(200, links, 'Ingredients linked to product successfully')
    );
});

const getProductIngredients = asyncHandler(async (req, res) => {
    const ingredients = await IngredientService.getProductIngredients(req.params.productId);
    return res.status(200).json(
        new ApiResponse(200, ingredients, 'Product ingredients fetched successfully')
    );
});

module.exports = {
    createIngredient,
    getAllIngredients,
    linkIngredientsToProduct,
    getProductIngredients
};
