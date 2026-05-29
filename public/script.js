const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');

let localStream;
const peers = {}; // Store peer connections: { socketId: RTCPeerConnection }
let currentRoomId = null;

// STUN servers for WebRTC
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Create local video element
const localVideo = document.createElement('video');
localVideo.muted = true; // Mute local video to prevent echo
localVideo.classList.add('local-video');

// Join Room Handler
joinBtn.addEventListener('click', async () => {
    const roomId = roomInput.value.trim();
    if (roomId && roomId !== currentRoomId) {
        currentRoomId = roomId;

        // UI loading state
        const originalBtnText = joinBtn.innerText;
        joinBtn.innerText = 'Joining...';
        joinBtn.disabled = true;
        joinBtn.setAttribute('aria-busy', 'true');

        // Initialize local media if not already done
        if (!localStream) {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                addVideoStream(localVideo, localStream);
            } catch (error) {
                console.error("Error accessing media devices.", error);
                alert("Could not access camera/microphone.");
                // Reset UI state on error
                joinBtn.innerText = originalBtnText;
                joinBtn.disabled = false;
                joinBtn.removeAttribute('aria-busy');
                currentRoomId = null;
                return;
            }
        }

        // Reset UI state
        joinBtn.innerText = originalBtnText;
        joinBtn.disabled = false;
        joinBtn.removeAttribute('aria-busy');

        // Tell server we joined the room
        socket.emit('join-room', roomId);

        // Clear remote videos if switching rooms
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
            if (v !== localVideo) {
                v.remove();
            }
        });

        // Close existing peer connections
        for (let peerId in peers) {
            peers[peerId].close();
            delete peers[peerId];
        }
    }
});

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

// ----------------------------------------------------
// WebRTC Signaling Logic
// ----------------------------------------------------

// When a new user joins the room, we (the existing users) create an offer
socket.on('user-joined', async (newUserId) => {
    console.log(`User ${newUserId} joined. Creating offer...`);
    const peerConnection = createPeerConnection(newUserId);
    peers[newUserId] = peerConnection;

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer, currentRoomId, newUserId);
    } catch (error) {
        console.error("Error creating offer:", error);
    }
});

// Receive an offer from an existing user
socket.on('offer', async (offer, fromId) => {
    console.log(`Received offer from ${fromId}`);
    const peerConnection = createPeerConnection(fromId);
    peers[fromId] = peerConnection;

    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer, currentRoomId, fromId);
    } catch (error) {
        console.error("Error handling offer:", error);
    }
});

// Receive an answer
socket.on('answer', async (answer, fromId) => {
    console.log(`Received answer from ${fromId}`);
    const peerConnection = peers[fromId];
    if (peerConnection) {
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error("Error setting remote description from answer:", error);
        }
    }
});

// Receive ICE Candidate
socket.on('ice-candidate', async (candidate, fromId) => {
    const peerConnection = peers[fromId];
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }
});

// Handle user disconnect
socket.on('user-disconnected', (userId) => {
    if (peers[userId]) {
        peers[userId].close();
        delete peers[userId];
    }
    // Remove video element
    const video = document.getElementById(userId);
    if (video) {
        video.remove();
    }
});

// Helper function to create a new RTCPeerConnection
function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(configuration);

    // Add local tracks to the connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, currentRoomId, userId);
        }
    };

    // Handle remote tracks
    peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;

        // Check if video element already exists for this user
        let video = document.getElementById(userId);
        if (!video) {
            video = document.createElement('video');
            video.id = userId;
            video.classList.add('remote-video');
            videoGrid.append(video);
        }

        video.srcObject = remoteStream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    };

    return peerConnection;
}
