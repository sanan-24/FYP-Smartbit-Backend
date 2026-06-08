const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const { generateToken, generateOTP } = require('../utils/helpers');
const { sendVerificationEmail, sendOTPEmail } = require('./email.service');
const jwt = require('jsonwebtoken');

class AuthService {
    static async generateAccessAndRefereshTokens(userId) {
        try {
            const user = await User.findById(userId);
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, "Something went wrong while generating access and refresh token");
        }
    }

    static async registerUser({ email, password, role }) {
        const existedUser = await User.findOne({ email });

        if (existedUser) {
            throw new ApiError(409, "User with email already exists");
        }

        const verificationToken = generateToken();

        const user = await User.create({
            email,
            password,
            role,
            verificationToken
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return createdUser;
    }

    static async loginUser({ email, password }) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        if (!user.isVerified) {
            throw new ApiError(401, "Please verify your email first");
        }

        const { accessToken, refreshToken } = await this.generateAccessAndRefereshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        return { loggedInUser, accessToken, refreshToken };
    }

    static async logoutUser(userId) {
        await User.findByIdAndUpdate(
            userId,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        );
    }

    static async refreshAccessToken(incomingRefreshToken) {
        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findById(decodedToken?._id);

            if (!user) {
                throw new ApiError(401, "Invalid refresh token");
            }

            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }

            const { accessToken, refreshToken: newRefreshToken } = await this.generateAccessAndRefereshTokens(user._id);

            return { accessToken, newRefreshToken };
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }

    static async verifyEmail(token) {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            throw new ApiError(400, "Invalid or expired verification token");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        return true;
    }

    static async forgotPasswordOTP(email) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const otp = generateOTP();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save({ validateBeforeSave: false });

        await sendOTPEmail(email, otp);

        return true;
    }

    static async verifyOTP({ email, otp }) {
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, "Invalid or expired OTP");
        }

        return true;
    }

    static async resetPassword({ email, otp, newPassword }) {
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, "Invalid or expired OTP");
        }

        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpiry = undefined;
        await user.save();

        return true;
    }
}

module.exports = AuthService;
