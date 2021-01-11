
module.exports.editorSockets = function (socketServer) {
    let io = require('socket.io')(socketServer);

    io.sockets.on('connection', function (socket) {

        console.log('new connection received in editor',);

        socket.on('disconnect', function () {
            console.log('editor socket disconnected!');
        });
        socket.on('join-room', (roomId, userId) => {
            // joining the room
            socket.join(roomId);
            // broadcasting  all the other user in the room that i have joined
            socket.to(roomId).broadcast.emit('user-connected', userId)
            console.log("user-connected : ", userId);
            console.log("user-connected to room : ", roomId);
            socket.on('disconnect', () => {
                socket.to(roomId).broadcast.emit('user-disconnected', userId);
                console.log("user-disconnected : ", userId);
            })
            socket.on('message', (evt) => {
                console.log(evt);
                socket.to(roomId).broadcast.emit('message', evt);
            })
        })


    });

}

