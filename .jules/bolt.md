## 2025-02-20 - Global Broadcast Bottleneck on Disconnect
**Learning:** Emitting global events for room-specific actions (like disconnects via `io.emit('user-disconnected', socket.id)`) causes an O(N) message storm across all clients connected to the server. This is a severe architectural bottleneck that degrades server performance and client bandwidth as user count scales.
**Action:** Tap into the Socket.io `disconnecting` event *before* the user leaves rooms. Iterate over `socket.rooms` and scope the broadcast strictly to users within the relevant rooms using `socket.to(room).emit()`.
