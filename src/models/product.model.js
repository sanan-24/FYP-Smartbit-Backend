const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String // Cloudinary URL
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        nutrition: {
            calories: { type: Number, default: 0 },
            protein: { type: Number, default: 0 },
            carbohydrates: { type: Number, default: 0 },
            fat: { type: Number, default: 0 }
        },
        allergens: {
            type: [String],
            default: []
        },
        flavorProfile: {
            type: [String], // e.g., ['Spicy', 'Cheesy', 'Savory']
            default: []
        },
        dietaryTags: {
            type: [String], // e.g., ['Low-carb', 'High-protein', 'Vegan']
            default: []
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        stock: {
            type: Number,
            default: 50,
            min: 0
        },
        salesCount: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        },
        numReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
