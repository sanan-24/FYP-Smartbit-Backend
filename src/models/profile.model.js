const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        profilePhoto: {
            type: String, // Cloudinary URL
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
