const Review = require('../models/review.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const { ApiError } = require('../utils/ApiError');

class ReviewService {
    static async addReview(customerId, reviewData) {
        const { orderId, productId, riderId, rating, comment, type } = reviewData;

        // Verify order exists and belongs to customer
        const order = await Order.findOne({ _id: orderId, customer: customerId });
        if (!order) {
            throw new ApiError(404, "Order not found or you are not authorized to review it");
        }

        if (order.status !== 'delivered') {
            throw new ApiError(400, "You can only review delivered orders");
        }

        const reviewDataToSave = {
            customer: customerId,
            order: orderId,
            rating,
            comment,
            type
        };

        if (type === 'product' && productId) {
            reviewDataToSave.product = productId;
        } else if (type === 'rider' && riderId) {
            reviewDataToSave.rider = riderId;
        }

        const review = await Review.create(reviewDataToSave);

        // Update average rating for Product or Rider
        if (type === 'product' && productId) {
            await this.updateProductRating(productId);
        } else if (type === 'rider' && riderId) {
            await this.updateRiderRating(riderId);
        }

        return review;
    }

    static async updateProductRating(productId) {
        const stats = await Review.aggregate([
            { $match: { product: productId, type: 'product' } },
            { $group: { _id: '$product', nReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                averageRating: Math.round(stats[0].avgRating * 10) / 10,
                numReviews: stats[0].nReviews
            });
        }
    }

    static async updateRiderRating(riderId) {
        const stats = await Review.aggregate([
            { $match: { rider: riderId, type: 'rider' } },
            { $group: { _id: '$rider', nReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
        ]);

        if (stats.length > 0) {
            await User.findByIdAndUpdate(riderId, {
                averageRating: Math.round(stats[0].avgRating * 10) / 10,
                numReviews: stats[0].nReviews
            });
        }
    }

    static async getProductReviews(productId) {
        return await Review.find({ product: productId, type: 'product' })
            .populate('customer', 'email')
            .sort({ createdAt: -1 });
    }

    static async getRiderReviews(riderId) {
        return await Review.find({ rider: riderId, type: 'rider' })
            .populate('customer', 'email')
            .sort({ createdAt: -1 });
    }
}

module.exports = ReviewService;
