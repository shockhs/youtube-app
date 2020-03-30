const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const path = require('path')

//IMPORT ROOMS CONTROLs
const { createRoom, getRoom, removeUser } = require('./rooms.js')

//ENV PORT
const PORT = process.env.PORT || 5000

//ROUTERS 
const router = require('./router')

//APP
const app = express()

app.use(cors())


if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const server = app.listen(PORT);
const io = socketio.listen(server);

app.use(router)

io.on('connection', (socket) => {
    console.log('Connected')
    socket.on('createRoom', ({ name, room, url }, callback) => {
        console.log(name, room, url)
        const { error, user } = createRoom({ id: socket.id, name, room, url });
        if (error) return callback(error);
        socket.join(user.room);
        //socket.broadcast.to(room).emit('message', { user: 'System', text: `User has joined` })
        callback();
    })
    socket.on('getUrlEvent', (callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('url', user.url)
        callback()
    })
    socket.on('event', ({ loaded, played }, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('data', { loaded, played })
        callback()
    })
    socket.on('playEvent', (status, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('status', { status })
        callback()
    })
    socket.on('seekEvent', (played, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('seekData', { played: played })
        callback()
    })
    socket.on('seekStatus', (status, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('statusSeeking', { seeking: status })
        callback()
    })
    socket.on('volumeEvent', (volume, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('volumeData', { volume: volume })
        callback()
    })
    socket.on('muteEvent', (muted, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('muteData', { muted: muted })
        callback()
    })
    socket.on('playbackEvent', (rate, callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('playbackData', { rate: rate })
        callback()
    })
    socket.on('controlsEvent', (callback) => {
        const user = getRoom(socket.id);
        io.to(user.room).emit('controlsData')
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            console.log(`Room has deleted`)
        }
    })
})


