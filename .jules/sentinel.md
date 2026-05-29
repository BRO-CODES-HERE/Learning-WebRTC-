## 2024-05-24 - DoS vulnerability via Socket.io array broadcast abuse
**Vulnerability:** Socket.io event arguments (`roomId`, `toId`) were passed directly to `socket.to()` without type or length validation. An attacker could pass a massive array instead of a string, causing `socket.to()` to broadcast to an exorbitant number of channels, resulting in memory exhaustion and server crash (Denial of Service).
**Learning:** `socket.to()` accepts arrays for multi-casting, so untyped event arguments from clients pose a significant DoS risk if an array is unexpectedly provided.
**Prevention:** Always strictly validate the type (e.g., `typeof id === 'string'`) and length (e.g., `<= 100`) of room IDs and target IDs received from socket clients before passing them to any socket functions.
