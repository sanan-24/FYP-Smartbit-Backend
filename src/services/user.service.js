const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');

class UserService {
    static async getAllUsers() {
        try {
            return await User.find().select("-password -refreshToken");
        } catch (error) {
            throw new ApiError(500, "Error while fetching users");
        }
    }

    static async updateUserRole(userId, role) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        user.role = role;
        await user.save({ validateBeforeSave: false });
        
        return await User.findById(userId).select("-password -refreshToken");
    }

    static async deleteUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        await User.findByIdAndDelete(userId);
        return true;
    }
}

module.exports = UserService;
