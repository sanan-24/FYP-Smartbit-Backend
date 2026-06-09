const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const { registerSchema, loginSchema, resetPasswordSchema } = require('../validators/auth.validator');
const AuthService = require('../services/auth.service');
const { asyncHandler } = require('../utils/AsyncHandler');

const registerUser = asyncHandler(async (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { email, password, role } = req.body;

    const createdUser = await AuthService.registerUser({ email, password, role });

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully. Please verify your email.")
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { email, password } = req.body;

    const { loggedInUser, accessToken, refreshToken } = await AuthService.loginUser({ email, password });

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res, next) => {
    await AuthService.logoutUser(req.user._id);

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const { accessToken, newRefreshToken } = await AuthService.refreshAccessToken(incomingRefreshToken);

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        );
});

const verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Verification token is missing");
    }

    await AuthService.verifyEmail(token);

    return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

const forgotPasswordOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    await AuthService.forgotPasswordOTP(email);

    return res.status(200).json(new ApiResponse(200, {}, "OTP sent to your email"));
});

const verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    await AuthService.verifyOTP({ email, otp });
  
    return res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
});

const resetPassword = asyncHandler(async (req, res, next) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { email, otp, newPassword } = req.body;

    await AuthService.resetPassword({ email, otp, newPassword });

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    forgotPasswordOTP,
    verifyOTP,
    resetPassword,
    getCurrentUser
};
