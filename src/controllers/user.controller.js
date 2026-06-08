const UserService = require('../services/user.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');
const { ApiError } = require('../utils/ApiError');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await UserService.getAllUsers();
    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
        throw new ApiError(400, "User ID and role are required");
    }

    const updatedUser = await UserService.updateUserRole(userId, role);
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User role updated successfully")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        throw new ApiError(400, "User ID is required");
    }

    await UserService.deleteUser(id);
    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    );
});

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser
};
