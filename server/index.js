const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

//IMPORT ROOMS CONTROLs
const { createRoom, getRoom } = require('./rooms.js')

//ENV PORT
const PORT = process.env.PORT || 5000

//ROUTERS 
const router = require('./router')

//APP
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(router)
app.use(cors())

io.on('connection', (socket) => {
    console.log('Connected')
    socket.on('createRoom', ({ name, url }, callback) => {
        const { error, room } = createRoom({ id: socket.id, name, url });
        if (error) return callback(error);
        socket.join(room.name);
        //socket.broadcast.to(room).emit('message', { user: 'System', text: `User has joined` })
        callback();
    })
    socket.on('event', ({ loaded, played }, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('data', { loaded, played })
        callback()
    })
    socket.on('playEvent', (status, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('status', { status })
        callback()
    })
    socket.on('seekEvent', (played, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('seekData', { played: played })
        callback()
    })
    socket.on('seekStatus', (status, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('statusSeeking', { seeking: status })
        callback()
    })
    socket.on('volumeEvent', (volume, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('volumeData', { volume: volume })
        callback()
    })
    socket.on('muteEvent', (muted, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('muteData', { muted: muted })
        callback()
    })
    socket.on('playbackEvent', (rate, callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('playbackData', { rate: rate })
        callback()
    })
    socket.on('controlsEvent', (callback) => {
        const room = getRoom(socket.id);
        io.to(room.name).emit('controlsData')
        callback()
    })
    socket.on('disconnect', () => {
        const room = removeUser(socket.id);
        if (room) {
            console.log(`Room has deleted`)
        }
    })
})

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`))