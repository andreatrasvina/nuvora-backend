import { db } from '../config/db.js';

//responde a la accion cuando un usuario se ha conectado
export function setupChat(io) {
  io.on('connection', async (socket) => {
    console.log('a user has connected!!');
    const roomID = socket.handshake.auth.room_id

    //responde a la accion cuando un usuario se ha desconectado
    socket.on('disconnect', () => {
      console.log('an user has disconnected');
    });

    //responde a la accion cuando un usuario envia un mensaje
    socket.on('chat message', async (msg) => {
      let result;
      try {
        result = await db.execute({
          sql: 'INSERT INTO messages (content) VALUES (:msg)',
          args: { msg }
        });
      } catch (e) {
        console.error(e);
        return;
      }

      console.log('message: ' + msg); //para verlos aki cerquita jeje
      io.emit('chat message', msg, result.lastInsertRowid.toString()); //c propagan a todos los usuarios
    });

    socket.on('chat room', async (msg_wrapper) => {
      let result
      try {
        result = await db.execute({
          sql: 'INSERT INTO messages (room_id, content) VALUES (:room_id, :msg)',
          args: msg_wrapper
        });
      } catch (e) {
        console.error(e);
        return;
      }

      console.log('message: ' + msg_wrapper.msg); //para verlos aki cerquita jeje
      io.emit('chat message', msg_wrapper.msg, result.lastInsertRowid.toString()); //c propagan a todos los usuarios
    });

    //por si acaso.. recupera el msj
    if (!socket.recovered) {
      try {
        console.log(roomID);
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
