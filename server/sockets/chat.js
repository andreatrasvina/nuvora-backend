import { db } from '../config/db.js';

//responde a la accion cuando un usuario se ha conectado

const users = {}

export function setupChat(io) {
  io.on('connection', async (socket) => {
    console.log('a user has connected!!');
    const roomID = socket.handshake.auth.room_id || '1'
    console.log(roomID);
    socket.join(roomID)

    //responde a la accion cuando un usuario se ha desconectado
    socket.on('disconnect', () => {
      socket.leave(roomID)
      console.log('an user has disconnected');
    });

    //responde a la accion cuando un usuario envia un mensaje
    socket.on('send message', async (msg) => {
      let result
      try {
        console.log({ room_id: roomID, msg: msg });
        result = await db.execute({
          sql: 'INSERT INTO messages (room_id, content) VALUES (:room_id, :msg)',
          args: { room_id: roomID, msg: msg }
        });
      } catch (e) {
        console.error(e);
        return;
      }
      console.log('room message: ' + msg.msg); //para verlos aki cerquita jeje
      io.to(roomID).emit(
        'chat message',
        msg,
        result.lastInsertRowid.toString()
      ); //c propagan a todos los usuarios

    });

    //por si acaso.. recupera el msj
    if (!socket.recovered) {
      try {
        const results = await db.execute({
          sql: 'SELECT id, content FROM messages WHERE id > ? AND room_id = ?',
          args: [socket.handshake.auth.serverOffset ?? 0, roomID]
        });

        results.rows.forEach(row => {
          socket.emit('chat message', row.content, row.id.toString());
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
}
