const OrderService = require('../services/order.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/AsyncHandler');
const { createOrderSchema, updateOrderStatusSchema, updatePaymentStatusSchema } = require('../validators/order.validator');

const createOrder = asyncHandler(async (req, res) => {
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const order = await OrderService.createOrder(req.user._id, req.body);

    return res.status(201).json(
        new ApiResponse(201, order, 'Order placed successfully')
    );
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderById(req.params.id);
    
    // Check if user is authorized to view this order
    if (req.user.role === 'user' && order.customer._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to view this order');
    }

    return res.status(200).json(
        new ApiResponse(200, order, 'Order fetched successfully')
    );
});

const getUserOrders = asyncHandler(async (req, res) => {
    const orders = await OrderService.getUserOrders(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, orders, 'Orders fetched successfully')
    );
});

const getRiderOrders = asyncHandler(async (req, res) => {
    const orders = await OrderService.getRiderOrders(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, orders, 'Rider orders fetched successfully')
    );
});

const getRiderStats = asyncHandler(async (req, res) => {
    const stats = await OrderService.getRiderStats(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, stats, 'Rider stats fetched successfully')
    );
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await OrderService.getAllOrders();
    return res.status(200).json(
        new ApiResponse(200, orders, 'All orders fetched successfully')
    );
});

const getUnassignedOrders = asyncHandler(async (req, res) => {
    const orders = await OrderService.getUnassignedOrders();
    return res.status(200).json(
        new ApiResponse(200, orders, 'Unassigned orders fetched successfully')
    );
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { error } = updateOrderStatusSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const order = await OrderService.updateOrderStatus(req.params.id, req.body.status);
    return res.status(200).json(
        new ApiResponse(200, order, 'Order status updated successfully')
    );
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { error } = updatePaymentStatusSchema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const order = await OrderService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
    return res.status(200).json(
        new ApiResponse(200, order, 'Payment status updated successfully')
    );
});

const assignRider = asyncHandler(async (req, res) => {
    const { riderId } = req.body;
    if (!riderId) {
        throw new ApiError(400, 'Rider ID is required');
    }

    const order = await OrderService.assignRider(req.params.id, riderId);
    return res.status(200).json(
        new ApiResponse(200, order, 'Rider assigned successfully')
    );
});

module.exports = {
    createOrder,
    getOrderById,
    getUserOrders,
    getRiderOrders,
    getRiderStats,
    getAllOrders,
    getUnassignedOrders,
    updateOrderStatus,
    updatePaymentStatus,
    assignRider
};
