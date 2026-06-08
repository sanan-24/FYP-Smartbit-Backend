const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');

class RiderService {
    static async createRider(riderData) {
        const { email, password } = riderData;

        const existedUser = await User.findOne({ email });
        if (existedUser) {
            throw new ApiError(409, 'User with this email already exists');
        }

        const rider = await User.create({
            email,
            password,
            role: 'rider',
            isVerified: true, // Admin created riders are verified by default
            isAvailable: true
        });

        const createdRider = await User.findById(rider._id).select('-password -refreshToken');
        return createdRider;
    }

    static async getAvailableRiders() {
        const riders = await User.find({ role: 'rider', isAvailable: true }).select('email isAvailable');
        
        const Profile = require('../models/profile.model');
        const ridersWithProfiles = await Promise.all(riders.map(async (rider) => {
            const profile = await Profile.findOne({ user: rider._id }).select('firstName lastName phoneNumber');
            return {
                _id: rider._id,
                email: rider.email,
                isAvailable: rider.isAvailable,
                firstName: profile?.firstName || 'Rider',
                lastName: profile?.lastName || (rider.email.split('@')[0]),
                phoneNumber: profile?.phoneNumber || 'N/A'
            };
        }));

        return ridersWithProfiles;
    }

    static async getAllRiders() {
        const riders = await User.find({ role: 'rider' }).select('email isAvailable');
        
        const Profile = require('../models/profile.model');
        const ridersWithProfiles = await Promise.all(riders.map(async (rider) => {
            const profile = await Profile.findOne({ user: rider._id }).select('firstName lastName phoneNumber');
            return {
                _id: rider._id,
                email: rider.email,
                isAvailable: rider.isAvailable,
                firstName: profile?.firstName || 'Rider',
                lastName: profile?.lastName || (rider.email.split('@')[0]),
                phoneNumber: profile?.phoneNumber || 'N/A'
            };
        }));

        return ridersWithProfiles;
    }

    static async deleteRider(riderId) {
        const rider = await User.findOne({ _id: riderId, role: 'rider' });
        if (!rider) {
            throw new ApiError(404, 'Rider not found');
        }

        // Check if rider is currently busy
        if (!rider.isAvailable) {
            throw new ApiError(400, 'Cannot delete rider while they are on a delivery');
        }

        await User.findByIdAndDelete(riderId);
        return true;
    }

    static async toggleAvailability(riderId, isAvailable) {
        const rider = await User.findOneAndUpdate(
            { _id: riderId, role: 'rider' },
            { $set: { isAvailable } },
            { new: true }
        ).select('email isAvailable');

        if (!rider) {
            throw new ApiError(404, 'Rider not found');
        }

        return rider;
    }

    static async getRiderLocation(riderId) {
        const rider = await User.findOne({ _id: riderId, role: 'rider' }).select('currentLocation');
        if (!rider) {
            throw new ApiError(404, 'Rider not found');
        }
        
        // If location is not set yet, return a default one to avoid "Not available" errors
        if (!rider.currentLocation || !rider.currentLocation.lat) {
            return {
                lat: 31.5204, // Default Lahore Lat
                lng: 74.3587, // Default Lahore Lng
                isDefault: true
            };
        }
        
        return rider.currentLocation;
    }
}

module.exports = RiderService;
