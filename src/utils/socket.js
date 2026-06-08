const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.CORS_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
            credentials: true,
            methods: ["GET", "POST", "PATCH"]
        },
        pingTimeout: 60000,
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Global broadcast for admin
        socket.join("admin_room");

        // Join a room based on user ID for targeted notifications
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their private room`);
        });

        // Rider location update handler
        socket.on("update_location", async (data) => {
            const { userId, lat, lng } = data;
            console.log(`Location update from Rider ${userId}: ${lat}, ${lng}`);
            
            // Broadcast to all clients (specifically customers tracking this rider)
            io.emit("rider_location_changed", { riderId: userId, lat, lng });

            // Optional: Persist to DB periodically (not every second to save performance)
            try {
                const User = require('../models/user.model');
                await User.findByIdAndUpdate(userId, {
                    $set: {
                        currentLocation: { lat, lng, lastUpdated: new Date() }
                    }
                });
            } catch (err) {
                console.error("Error saving rider location:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitToUser,
    emitToAll
};
