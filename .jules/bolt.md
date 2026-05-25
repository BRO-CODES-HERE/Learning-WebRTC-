## 2024-05-25 - [O(N) Disconnect Broadcast Spam]
**Learning:** Global broadcasts (`io.emit`) on user disconnect cause O(N) message spam across the entire server in multi-room WebSocket environments, wasting server bandwidth and client CPU.
**Action:** Use the `disconnecting` event (where `socket.rooms` is still available) to scope disconnect broadcasts only to the rooms the user was actually in.
