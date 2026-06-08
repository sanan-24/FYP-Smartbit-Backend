const app = require('../src/app');
const connectDB = require('../src/config/database');

// This function will be called by Vercel for every request
module.exports = async (req, res) => {
    try {
        // Ensure DB is connected
        await connectDB();
        
        // Let Express handle the request
        return app(req, res);
    } catch (error) {
        console.error("Vercel entry point error:", error);
        res.status(500).send("Internal Server Error");
    }
};
