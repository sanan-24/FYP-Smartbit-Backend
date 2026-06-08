const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        // Review can be for a product
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        // Or for a rider
        rider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxLength: 500
        },
        type: {
            type: String,
            enum: ['product', 'rider'],
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent multiple reviews for the same product/rider from the same order
reviewSchema.index({ order: 1, product: 1, rider: 1, type: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
