const DashboardService = require('../services/dashboard.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/AsyncHandler');

const getAdminDashboardStats = asyncHandler(async (req, res) => {
    const { timeframe } = req.query;
    const data = await DashboardService.getAdminStats(timeframe);
    
    return res.status(200).json(
        new ApiResponse(200, data, "Admin dashboard stats fetched successfully")
    );
});

const exportStats = asyncHandler(async (req, res) => {
    const { timeframe } = req.query;
    const csvData = await DashboardService.getExportData(timeframe);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=stats-${timeframe}-${Date.now()}.csv`);
    
    return res.status(200).send(csvData);
});

module.exports = {
    getAdminDashboardStats,
    exportStats
};
