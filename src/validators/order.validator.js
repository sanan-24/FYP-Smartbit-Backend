const Joi = require('joi');

const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            product: Joi.string().required(),
            quantity: Joi.number().min(1).required()
        })
    ).min(1).required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'online').default('cash'),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    deliveryFee: Joi.number().default(0),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed').optional(),
    transactionId: Joi.string().optional()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'cooking', 'out-for-delivery', 'delivered', 'cancelled').required()
});

const updatePaymentStatusSchema = Joi.object({
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed').required()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema
};
