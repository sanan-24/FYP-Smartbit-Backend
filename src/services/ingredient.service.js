const Ingredient = require('../models/ingredient.model');
const ProductIngredient = require('../models/productIngredient.model');
const Product = require('../models/product.model');
const { ApiError } = require('../utils/ApiError');

class IngredientService {
    static async createIngredient(ingredientData) {
        return await Ingredient.create(ingredientData);
    }

    static async getAllIngredients() {
        return await Ingredient.find();
    }

    static async linkIngredientsToProduct(productId, ingredientsList) {
        // ingredientsList: [{ ingredientId, quantity, unit }]
        
        // Clear existing links
        await ProductIngredient.deleteMany({ productId });

        // Create new links
        const links = ingredientsList.map(item => ({
            productId,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit
        }));

        return await ProductIngredient.insertMany(links);
    }

    static async getProductIngredients(productId) {
        return await ProductIngredient.find({ productId }).populate('ingredientId');
    }
}

module.exports = IngredientService;
