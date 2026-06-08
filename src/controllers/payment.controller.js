const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { asyncHandler } = require('../utils/AsyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount, currency = 'pkr' } = req.body;

    if (!amount) {
        throw new ApiError(400, "Amount is required");
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency,
            metadata: { integration_check: 'accept_a_payment' },
        });

        return res.status(200).json(
            new ApiResponse(200, {
                clientSecret: paymentIntent.client_secret
            }, "Payment intent created successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error creating payment intent");
    }
});

module.exports = {
    createPaymentIntent
};
