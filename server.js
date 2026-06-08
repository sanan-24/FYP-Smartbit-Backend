require('dotenv').config();
const connectDB = require('./src/config/database');
const app = require('./src/app');

const http = require('http');
const { initializeSocket } = require('./src/utils/socket');

const PORT = process.env.PORT || 5000;

/* Original Server Start Logic (Commented out)
const server = http.createServer(app);

connectDB()
    .then(() => {
        initializeSocket(server);
        server.listen(PORT, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
*/

// Function to start server (Optimized for Vercel/Local)
const startServer = async () => {
    try {
        await connectDB();
        
        const server = http.createServer(app);
        initializeSocket(server);
        
        server.listen(PORT, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
        });
    } catch (err) {
        console.log("Failed to start server:", err);
    }
};

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    startServer();
}

// Export app for Vercel
module.exports = app;
