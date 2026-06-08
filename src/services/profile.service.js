const Profile = require('../models/profile.model');
const { ApiError } = require('../utils/ApiError');
const { uploadOnCloudinary } = require('../utils/cloudinary');

class ProfileService {
    static async createOrUpdateProfile(userId, profileData, localFilePath) {
        let profilePhotoUrl = "";

        if (localFilePath) {
            const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
            if (!cloudinaryResponse) {
                throw new ApiError(500, "Error while uploading profile photo to Cloudinary");
            }
            profilePhotoUrl = cloudinaryResponse.url;
        }

        const updateData = {
            ...profileData,
            user: userId
        };

        if (profilePhotoUrl) {
            updateData.profilePhoto = profilePhotoUrl;
        }

        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        if (!profile) {
            throw new ApiError(500, "Something went wrong while creating/updating profile");
        }

        return profile;
    }

    static async getProfile(userId) {
        const profile = await Profile.findOne({ user: userId }).populate("user", "email role");
        if (!profile) {
            throw new ApiError(404, "Profile not found");
        }
        return profile;
    }
}

module.exports = ProfileService;
