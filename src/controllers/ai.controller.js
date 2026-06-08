const AIService = require('../services/ai.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');
const { ApiError } = require('../utils/ApiError');

const getRecommendation = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query) {
        throw new ApiError(400, "User query is required");
    }

    const suggestion = await AIService.getAISuggestion(query);

    return res.status(200).json(
        new ApiResponse(200, { suggestion }, "AI recommendation generated successfully")
    );
});

module.exports = {
    getRecommendation
};
