const RecommendationService = require('../services/recommendation.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');

const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    const recommendations = await RecommendationService.getRecommendations(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, recommendations, 'Personalized recommendations fetched successfully')
    );
});

const getTrendingItems = asyncHandler(async (req, res) => {
    const trending = await RecommendationService.getTrendingProducts();
    return res.status(200).json(
        new ApiResponse(200, trending, 'Trending items fetched successfully')
    );
});

module.exports = {
    getPersonalizedRecommendations,
    getTrendingItems
};
