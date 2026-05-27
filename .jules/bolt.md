## 2024-05-27 - [Avoid redundant media pipeline initializations in WebRTC ontrack]
**Learning:** The `RTCPeerConnection.ontrack` event fires once per track (e.g., audio and video separately). Re-assigning `video.srcObject` and adding `loadedmetadata` event listeners on every track event causes redundant media pipeline re-initializations, potential memory leaks (duplicate event listeners), and video playback flickering.
**Action:** Only initialize the media stream and attach event listeners once per remote stream, typically when the corresponding video element is first created.
