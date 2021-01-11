const express = require('express');
const app = express();
// const port = 8000;
const server = require('http').Server(app)
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
// // extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// const videoServer = require('http').Server(app);
const videoSockets = require('./config/video_sockets').videoSockets(server);
// const editorServer = require('http').Server(app);
const editorSockets = require('./config/editor_sockets').editorSockets(server);
// videoServer.listen(5002);
// editorServer.listen(5001);
// console.log('editor server is listening on port 5001');
// console.log('video server is listening on port 5002');


app.use(express.static('assets'))

const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/', require('./routes'));

server.listen(process.env.PORT || 3000);
// listening to the port
// app.listen(process.env.PORT || port, function (err) {
//     if (err) {
//         console.log("ERROR while launching the page!!");
//     }
//     console.log("The server is up and running on port:: ", port);
// })
