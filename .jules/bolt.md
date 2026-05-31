## 2024-05-31 - WebRTC ontrack Event Firing
**Learning:** In WebRTC, the `RTCPeerConnection.ontrack` event fires separately for each track (e.g., once for audio, once for video). Assigning `video.srcObject = stream` and adding event listeners on every `ontrack` firing leads to redundant media pipeline resets and memory leaks from multiple `loadedmetadata` event listeners.
**Action:** Always ensure `video.srcObject` and associated media initialization logic runs only once per remote stream, such as within a check that creates the video element (`if (!video) { ... }`).
