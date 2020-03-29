const rooms = [];

const createRoom = ({ id, name, url }) => {
    name = name.trim().toLowerCase();

    const room = { id, name, url }
    rooms.push(room);
    return { room };
}

const getRoom = (id) => rooms.find(room => room.id === id)
const getActiveRooms = () => rooms.length;

module.exports = { createRoom, getRoom };
