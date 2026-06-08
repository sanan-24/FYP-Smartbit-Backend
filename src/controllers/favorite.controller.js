const Favorite = require('../models/favorite.model');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/AsyncHandler');

const toggleFavorite = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const existingFavorite = await Favorite.findOne({ user: userId, product: productId });

    if (existingFavorite) {
        await Favorite.findByIdAndDelete(existingFavorite._id);
        return res.status(200).json(
            new ApiResponse(200, null, "Removed from favorites")
        );
    } else {
        const favorite = await Favorite.create({ user: userId, product: productId });
        return res.status(201).json(
            new ApiResponse(201, favorite, "Added to favorites")
        );
    }
});

const getMyFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ user: req.user._id })
        .populate('product')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, favorites, "Favorites fetched successfully")
    );
});

module.exports = {
    toggleFavorite,
    getMyFavorites
};
