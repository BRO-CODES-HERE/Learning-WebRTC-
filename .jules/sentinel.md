## 2024-05-24 - Unvalidated Socket.io Event Arguments Enable Broadcast Abuse and DoS
**Vulnerability:** Socket.io event listeners did not validate arguments. In `socket.to(toId)`, passing an array instead of a string broadcasts to multiple rooms at once. Furthermore, passing deeply nested objects or massive strings can cause server-side DoS or memory issues.
**Learning:** `socket.to(toId)` accepts arrays. When no input validation exists for WebRTC signaling inputs, an attacker can trivially mass-broadcast messages or crash the signaling server.
**Prevention:** Strictly type-check and limit lengths for all inputs received over websockets (`typeof id === 'string' && id.length > 0 && id.length <= 100`). Always validate data at the application boundary, even in event handlers.
