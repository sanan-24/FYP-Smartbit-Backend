const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nutritionPer100g: {
            calories: { type: Number, default: 0 },
            carbohydrates: { type: Number, default: 0 },
            protein: { type: Number, default: 0 },
            fat: { type: Number, default: 0 },
            sugar: { type: Number, default: 0 }
        },
        allergens: {
            type: [String],
            default: []
        },
        isVegan: {
            type: Boolean,
            default: false
        },
        isVegetarian: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
