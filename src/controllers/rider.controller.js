const RiderService = require('../services/rider.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');
const { ApiError } = require('../utils/ApiError');

const createRider = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    const rider = await RiderService.createRider({ email, password });

    return res.status(201).json(
        new ApiResponse(201, rider, 'Rider created successfully')
    );
});

const getAvailableRiders = asyncHandler(async (req, res) => {
    const riders = await RiderService.getAvailableRiders();
    return res.status(200).json(
        new ApiResponse(200, riders, 'Available riders fetched successfully')
    );
});

const getAllRiders = asyncHandler(async (req, res) => {
    const riders = await RiderService.getAllRiders();
    return res.status(200).json(
        new ApiResponse(200, riders, 'All riders fetched successfully')
    );
});

const deleteRider = asyncHandler(async (req, res) => {
    await RiderService.deleteRider(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, null, 'Rider deleted successfully')
    );
});

const toggleAvailability = asyncHandler(async (req, res) => {
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
        throw new ApiError(400, 'isAvailable status is required and must be a boolean');
    }

    const rider = await RiderService.toggleAvailability(req.user._id, isAvailable);

    return res.status(200).json(
        new ApiResponse(200, rider, `Rider status marked as ${isAvailable ? 'Online' : 'Offline'}`)
    );
});

const getRiderLocation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const location = await RiderService.getRiderLocation(id);

    return res.status(200).json(
        new ApiResponse(200, location, "Rider location fetched successfully")
    );
});

module.exports = {
    createRider,
    getAvailableRiders,
    getAllRiders,
    deleteRider,
    toggleAvailability,
    getRiderLocation
};
