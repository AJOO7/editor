var socket = io('/');
// selecting the editor
const editor = document.getElementById("editor")
// adding event listener for keyup on the text area
editor.addEventListener("keyup", (evt) => {
    const text = editor.value
    socket.send(text)
})

// sending data
socket.on('message', (data) => {
    editor.value = data
})
// const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    path: "/peerjs",
    host: '/',
    port: '443',
});

const myVideo = document.createElement('video');
myVideo.muted = true;


const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        console.log("-------***--------");
        console.log("user connected : ", userId);
        connectToNewUser(userId, stream);
        console.log("-------***--------");
    });
});



myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});



socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})



function connectToNewUser(userId, stream) {
    console.log("######");
    const call = myPeer.call(userId, stream);
    console.log("call defined");
    const video = document.createElement('video');
    console.log("video element created");
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        console.log("adding user video to other");
    })
    console.log("######");
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}