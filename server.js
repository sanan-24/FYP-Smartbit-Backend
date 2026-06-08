require('dotenv').config();
const connectDB = require('./src/config/database');
const app = require('./src/app');

const http = require('http');
const { initializeSocket } = require('./src/utils/socket');

const PORT = process.env.PORT || 5000;
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
