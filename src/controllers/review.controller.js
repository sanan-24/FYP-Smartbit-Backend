const ReviewService = require('../services/review.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');
const { ApiError } = require('../utils/ApiError');

const addReview = asyncHandler(async (req, res) => {
    const review = await ReviewService.addReview(req.user._id, req.body);
    return res.status(201).json(
        new ApiResponse(201, review, "Review added successfully")
    );
});

const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await ReviewService.getProductReviews(req.params.productId);
    return res.status(200).json(
        new ApiResponse(200, reviews, "Product reviews fetched successfully")
    );
});

const getRiderReviews = asyncHandler(async (req, res) => {
    const reviews = await ReviewService.getRiderReviews(req.params.riderId);
    return res.status(200).json(
        new ApiResponse(200, reviews, "Rider reviews fetched successfully")
    );
});

module.exports = {
    addReview,
    getProductReviews,
    getRiderReviews
};
