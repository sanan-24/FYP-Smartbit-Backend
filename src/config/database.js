const mongoose = require('mongoose');

let isConnected = false;

/* Original Code (Commented out)
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};
*/

// New connectDB for Vercel/Serverless
const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        isConnected = !!connectionInstance.connections[0].readyState;
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        // Don't exit process in serverless, just throw
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
