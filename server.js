const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user joins a room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit('user-joined', socket.id);
    });

    // Handle WebRTC offer
    socket.on('offer', (offer, roomId, toId) => {
        socket.to(toId).emit('offer', offer, socket.id);
    });

    // Handle WebRTC answer
    socket.on('answer', (answer, roomId, toId) => {
        socket.to(toId).emit('answer', answer, socket.id);
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (candidate, roomId, toId) => {
        socket.to(toId).emit('ice-candidate', candidate, socket.id);
    });

    // Handle disconnection
    // Use 'disconnecting' instead of 'disconnect' so we can access socket.rooms
    // before the socket leaves them. This allows us to emit O(R) messages to specific
    // rooms instead of an O(N) global broadcast.
    socket.on('disconnecting', () => {
        console.log('User disconnecting:', socket.id);
        socket.rooms.forEach((room) => {
            if (room !== socket.id) {
                // Let other peers in the room know to close their PeerConnections
                socket.to(room).emit('user-disconnected', socket.id);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
