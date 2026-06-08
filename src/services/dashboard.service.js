const Order = require('../models/order.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

class DashboardService {
    static async getAdminStats(timeframe = 'weekly') {
        let dateFilter = {};
        const now = new Date();

        if (timeframe === 'daily') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { createdAt: { $gte: startOfDay } };
        } else if (timeframe === 'weekly') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: sevenDaysAgo } };
        } else if (timeframe === 'monthly') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
        } else if (timeframe === 'yearly') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: oneYearAgo } };
        }

        const totalOrders = await Order.countDocuments(dateFilter);
        
        const revenueData = await Order.aggregate([
            { $match: { ...dateFilter, paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        const totalUsers = await User.countDocuments({ role: 'user', ...dateFilter });
        const activeRiders = await User.countDocuments({ role: 'rider', isAvailable: true });

        // Chart Data based on timeframe
        let groupFormat = "%Y-%m-%d";
        if (timeframe === 'monthly') groupFormat = "%Y-%m-%d";
        if (timeframe === 'yearly') groupFormat = "%Y-%m";
        if (timeframe === 'daily') groupFormat = "%H:00";

        const orderVolume = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
                    orders: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    orders: 1
                }
            },
            { $sort: { "name": 1 } }
        ]);

        const revenueStream = await Order.aggregate([
            { $match: { ...dateFilter, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    revenue: 1
                }
            },
            { $sort: { "name": 1 } }
        ]);

        return {
            stats: {
                totalOrders,
                totalRevenue,
                totalUsers,
                activeRiders
            },
            charts: {
                orderVolume,
                revenueStream
            }
        };
    }

    static async getExportData(timeframe = 'weekly') {
        let dateFilter = {};
        const now = new Date();

        if (timeframe === 'daily') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { createdAt: { $gte: startOfDay } };
        } else if (timeframe === 'weekly') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: sevenDaysAgo } };
        } else if (timeframe === 'monthly') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
        } else if (timeframe === 'yearly') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: oneYearAgo } };
        }

        const orders = await Order.find(dateFilter)
            .populate('customer', 'email')
            .sort({ createdAt: -1 });

        // Convert to CSV format
        let csv = 'Order ID,Customer,Amount,Status,Payment,Date\n';
        orders.forEach(order => {
            csv += `${order._id},${order.customer?.email || 'N/A'},${order.totalAmount},${order.status},${order.paymentStatus},${order.createdAt.toISOString()}\n`;
        });

        return csv;
    }
}

module.exports = DashboardService;
