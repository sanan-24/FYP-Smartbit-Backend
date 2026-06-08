const ProfileService = require('../services/profile.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/AsyncHandler');

const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phoneNumber, location } = req.body;
    const userId = req.user._id;

    const existingProfile = await ProfileService.getProfile(userId).catch(() => null);

    // If it's a new profile, required fields must be present
    if (!existingProfile) {
        if (!firstName || !lastName) {
            throw new ApiError(400, "First name and last name are required for new profile");
        }
        if (!req.file) {
            throw new ApiError(400, "Profile photo is required for new profile");
        }
    }

    // Build update object with only provided fields
    const profileData = {};
    if (firstName) profileData.firstName = firstName;
    if (lastName) profileData.lastName = lastName;
    if (phoneNumber) profileData.phoneNumber = phoneNumber;
    if (location) profileData.location = location;

    const profile = await ProfileService.createOrUpdateProfile(
        userId, 
        profileData,
        req.file?.path
    );

    return res.status(200).json(
        new ApiResponse(200, profile, existingProfile ? "Profile updated successfully" : "Profile created successfully")
    );
});

const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await ProfileService.getProfile(req.user._id);
    
    return res.status(200).json(
        new ApiResponse(200, profile, "Profile fetched successfully")
    );
});

module.exports = {
    updateProfile,
    getMyProfile
};
