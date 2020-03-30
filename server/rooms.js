const rooms = [];
const users = [];

const createRoom = ({ id, name, room, url }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find(user => user.room === room && user.name === name)
    const existingRoom = rooms.find(item => item.room === room)

    let user;
    if (!existingRoom) {
        user = { id, name, room, url }
        users.push(user);
        rooms.push({ room, url });
    } else {
        user = { id, name, room, url: existingRoom.url }
        users.push(user);
    }
    if (existingUser) {
        return { error: 'Username is taken' }
    }
    return { user };
}



/*const createRoom = ({ id, name, url }) => {
    name = name.trim().toLowerCase();
    const existingRoom = rooms.find(room => room.name === name)
    const user = { id, name, url }
    users.push(user);
    let room;
    if (!existingRoom) {
        room = { id, name, url }
        rooms.push(room);
    } else {
        room = existingRoom
    }
    return { user, room };
}*/


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) return users.splice(index, 1)[0];
}

const getRoom = (id) => users.find(user => user.id === id);

module.exports = { createRoom, removeUser, getRoom };
