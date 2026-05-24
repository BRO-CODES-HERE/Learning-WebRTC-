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

    // Input validation helper
    const isValidId = (id) => typeof id === 'string' && id.length > 0 && id.length <= 100;

    // When a user joins a room
    socket.on('join-room', (roomId) => {
        if (!isValidId(roomId)) return; // Security: Validate room ID to prevent DoS via arrays or large strings

        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit('user-joined', socket.id);
    });

    // Handle WebRTC offer
    socket.on('offer', (offer, roomId, toId) => {
        if (!isValidId(roomId) || !isValidId(toId)) return; // Security: Validate IDs
        socket.to(toId).emit('offer', offer, socket.id);
    });

    // Handle WebRTC answer
    socket.on('answer', (answer, roomId, toId) => {
        if (!isValidId(roomId) || !isValidId(toId)) return; // Security: Validate IDs
        socket.to(toId).emit('answer', answer, socket.id);
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (candidate, roomId, toId) => {
        if (!isValidId(roomId) || !isValidId(toId)) return; // Security: Validate IDs
        socket.to(toId).emit('ice-candidate', candidate, socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Broadcasting disconnect to all rooms this user was in is handled automatically by socket.io
        // But we need to let other peers know to close their PeerConnections
        io.emit('user-disconnected', socket.id); // For simplicity, emitting to all, can be scoped to rooms
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
