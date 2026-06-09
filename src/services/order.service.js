const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { ApiError } = require('../utils/ApiError');

class OrderService {
    static async createOrder(customerId, orderData) {
        const { 
            items, 
            paymentMethod, 
            paymentStatus,
            transactionId,
            firstName, 
            lastName, 
            phoneNumber, 
            address, 
            city, 
            postalCode,
            deliveryFee = 0 
        } = orderData;
        
        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new ApiError(404, `Product with id ${item.product} not found`);
            }
            if (!product.isAvailable) {
                throw new ApiError(400, `Product ${product.name} is currently not available`);
            }

            if (product.stock < item.quantity) {
                throw new ApiError(400, `Product ${product.name} is out of stock or insufficient quantity. Available: ${product.stock}`);
            }

            const itemPrice = product.price * item.quantity;
            subtotal += itemPrice;

            processedItems.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price
            });

            // Update sales count and decrease stock
            product.salesCount += item.quantity;
            product.stock -= item.quantity;
            
            // If stock becomes 0, mark as unavailable automatically
            if (product.stock === 0) {
                product.isAvailable = false;
            }
            
            await product.save();
        }

        const totalAmount = subtotal + deliveryFee;

        const order = await Order.create({
            customer: customerId,
            items: processedItems,
            subtotal,
            deliveryFee,
            totalAmount,
            paymentMethod,
            firstName,
            lastName,
            phoneNumber,
            address,
            city,
            postalCode,
            status: 'pending',
            paymentStatus: paymentStatus || 'pending',
            transactionId
        });

        const createdOrder = await Order.findById(order._id)
            .populate('customer', 'email')
            .populate('items.product', 'name image');

        // Real-time update for Admin: Notify about new order
        const { emitToAll, getIO } = require('../utils/socket');
        
        // Try emitting to all and specific admin room
        emitToAll('new_order_placed', {
            order: createdOrder,
            message: "New order received!"
        });
        
        const io = getIO();
        if (io) {
            io.to("admin_room").emit('new_order_placed', {
                order: createdOrder,
                message: "New order received!"
            });
        }

        return createdOrder;
    }

    static async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate('customer', 'email')
            .populate('items.product', 'name image price')
            .populate('rider', 'email');
        
        if (!order) {
            throw new ApiError(404, 'Order not found');
        }
        return order;
    }

    static async getUserOrders(customerId) {
        return await Order.find({ customer: customerId })
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });
    }

    static async getRiderOrders(riderId) {
        return await Order.find({ rider: riderId })
            .populate('customer', 'email')
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });
    }

    static async getRiderStats(riderId) {
        const orders = await Order.find({ rider: riderId });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const totalEarnings = orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
            
        const todayEarnings = orders
            .filter(o => o.status === 'delivered' && o.updatedAt >= today)
            .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
            
        const activeDeliveries = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
        
        const relevantOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
        const successRate = relevantOrders.length > 0 
            ? Math.round((completedOrders / relevantOrders.length) * 100) 
            : 100;

        const Review = require('../models/review.model');
        const stats = await Review.aggregate([
            { $match: { rider: riderId, type: 'rider' } },
            { $group: { _id: '$rider', nReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
        ]);

        const averageRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
        const numReviews = stats.length > 0 ? stats[0].nReviews : 0;

        return {
            todayEarnings,
            totalEarnings,
            completedOrders,
            activeDeliveries,
            successRate: `${successRate}%`,
            averageRating,
            numReviews
        };
    }

    static async getAllOrders() {
        return await Order.find()
            .populate('customer', 'email')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 });
    }

    static async getUnassignedOrders() {
        return await Order.find({ 
            rider: { $exists: false },
            status: { $in: ['pending', 'confirmed', 'cooking'] }
        })
        .populate('customer', 'email')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 });
    }

    static async updateOrderStatus(orderId, status) {
        const order = await Order.findById(orderId).populate('rider').populate('customer');

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        order.status = status;
        await order.save();

        // Real-time update via Socket.io
        const { emitToUser } = require('../utils/socket');
        
        // Notify Customer
        emitToUser(order.customer._id.toString(), 'order_status_update', {
            orderId: order._id,
            status: status,
            message: `Your order is now ${status}`
        });

        // Notify Rider if assigned
        if (order.rider) {
            emitToUser(order.rider._id.toString(), 'order_status_update', {
                orderId: order._id,
                status: status
            });
        }

        // If order is delivered or cancelled, make the rider available again
        if ((status === 'delivered' || status === 'cancelled') && order.rider) {
            const User = require('../models/user.model');
            await User.findByIdAndUpdate(order.rider._id, { $set: { isAvailable: true } });
        }

        // Restore stock if order is cancelled
        if (status === 'cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    // If stock was 0 and now restored, make it available again
                    if (product.stock > 0) {
                        product.isAvailable = true;
                    }
                    await product.save();
                }
            }
        }

        return await Order.findById(orderId).populate('customer', 'email');
    }

    static async updatePaymentStatus(orderId, paymentStatus) {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { paymentStatus } },
            { new: true }
        ).populate('customer');

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        // Notify customer about payment status
        const { emitToUser } = require('../utils/socket');
        emitToUser(order.customer._id.toString(), 'payment_status_update', {
            orderId: order._id,
            paymentStatus
        });

        return order;
    }

    static async assignRider(orderId, riderId) {
        const User = require('../models/user.model');
        const rider = await User.findOne({ _id: riderId, role: 'rider' });

        if (!rider) {
            throw new ApiError(404, 'Rider not found');
        }

        if (!rider.isAvailable) {
            throw new ApiError(400, 'Rider is currently busy with another delivery');
        }

        const order = await Order.findById(orderId).populate('customer');

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        if (['delivered', 'cancelled'].includes(order.status)) {
            throw new ApiError(400, `Cannot assign rider to an order that is already ${order.status}`);
        }

        // Generate a 4-digit OTP for delivery verification
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        order.rider = riderId;
        // order.status = 'out-for-delivery'; // Don't change status automatically
        order.deliveryOTP = otp;
        await order.save();

        // Mark rider as busy
        rider.isAvailable = false;
        await rider.save();

        // Real-time update via Socket.io
        const { emitToUser } = require('../utils/socket');
        
        // Notify Rider
        emitToUser(riderId.toString(), 'new_order_assigned', {
            orderId: order._id,
            message: "A new order has been assigned to you!"
        });

        // Notify Customer
        emitToUser(order.customer._id.toString(), 'order_status_update', {
            orderId: order._id,
            status: 'out-for-delivery',
            rider: {
                name: `${rider.email.split('@')[0]}`, // Fallback to email part if no profile
                phoneNumber: rider.phoneNumber
            }
        });

        return await Order.findById(orderId).populate('rider', 'email');
    }
}

module.exports = OrderService;
