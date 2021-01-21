var socket = io('/');
const editor = document.getElementById("editor");
const mirrorEditor = CodeMirror.fromTextArea(
    editor,
    {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
    });
mirrorEditor.setSize("100%", "100%");
mirrorEditor.on("keyup", function (evt) {
    const text = mirrorEditor.getValue();
    socket.send(text)
    console.log(text, "1", text.length);
})
function copyToClipboard() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(mirrorEditor.getValue()).select();
    document.execCommand("copy");
    $temp.remove();
}
function reset() {
    mirrorEditor.setValue("");
}
var input = document.getElementById("select");
function selectTheme() {
    var theme = input.options[input.selectedIndex].textContent;
    mirrorEditor.setOption("theme", theme);
}
var inputLang = document.getElementById("selectLang");
function selectLang() {
    var lang = inputLang.options[inputLang.selectedIndex].textContent;
    mirrorEditor.setOption("mode", lang);
}

let fileInput = document.getElementById("fileInput");
fileInput.addEventListener('change', () => {
    let files = fileInput.files;

    if (files.length == 0) return;
    const file = files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        mirrorEditor.setValue(lines.join('\n'));

    };

    reader.onerror = (e) => alert(e.target.error.name);

    reader.readAsText(file);
});

$("#download").click(function (e) {

    e.preventDefault();
    saveTextAsFile();
});
function saveTextAsFile() {
    var textFileAsBlob = new Blob([mirrorEditor.getValue()], { type: 'application/json' });
    var fileNameToSaveAs = +Date.now() + ".txt";

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "My Hidden Link";

    window.URL = window.URL || window.webkitURL;

    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

socket.on('message', (data) => {
    mirrorEditor.setValue(data);
})

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
        connectToNewUser(userId, stream);
    });
});



myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});



socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})



function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
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