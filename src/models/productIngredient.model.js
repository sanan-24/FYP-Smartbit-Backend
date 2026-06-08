const mongoose = require('mongoose');

const productIngredientSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        ingredientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['grams', 'piece', 'ml'],
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Index for faster lookups of ingredients for a product
productIngredientSchema.index({ productId: 1, ingredientId: 1 }, { unique: true });

const ProductIngredient = mongoose.model('ProductIngredient', productIngredientSchema);

module.exports = ProductIngredient;
