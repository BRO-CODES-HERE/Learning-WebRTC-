## 2024-05-26 - Missing Input Validation on socket.io Event Arguments
**Vulnerability:** Socket.io event arguments (`roomId`, `toId`) were not validated for type or length before being passed to `socket.to()`.
**Learning:** `socket.to()` in socket.io can accept an array of strings. If a malicious client passes an array of many IDs instead of a single string ID, this can lead to array broadcast abuse causing DoS (Denial of Service). Additionally, large payloads (e.g. huge string lengths) for these parameters could exhaust server memory.
**Prevention:** Always validate all input arguments received via socket events for proper type (`typeof id === 'string'`) and enforce a maximum length.
