import { db } from '../config/db.js';

//responde a la accion cuando un usuario se ha conectado

const users = {}

export function setupChat(io) {
  io.on('connection', async (socket) => {
    const roomID = socket.handshake.auth.room_id || '1'
    // console.log('a user has connected!! to room' ,roomID);
    socket.join(roomID)

    //responde a la accion cuando un usuario se ha desconectado
    socket.on('disconnect', () => {
      socket.leave(roomID)
      console.log('an user has disconnected');
    });

    //responde a la accion cuando un usuario envia un mensaje
    socket.on('send message', async (msg_wrapper) => {
      let result
      const { media, msg } = msg_wrapper
      const media64 = Buffer.from(media).toString('base64')
      msg_wrapper.media = media64

      try {
        result = await db.execute({
          sql: 'INSERT INTO messages (room_id, content, media) VALUES (:room_id, :msg, :media)',
          args: { room_id: roomID, msg: msg, media: media64 }
        });
      } catch (e) {
        console.error(e);
        return;
      }
      console.log('room message: ' + msg, media); //para verlos aki cerquita jeje
      io.to(roomID).emit(
        'chat message',
        msg_wrapper,
        result.lastInsertRowid.toString()
      ); //c propagan a todos los usuarios

    });

    //por si acaso.. recupera el msj
    if (!socket.recovered) {
      try {
        const results = await db.execute({
          sql: 'SELECT id, content, media FROM messages WHERE id > ? AND room_id = ?',
          args: [socket.handshake.auth.serverOffset ?? 0, roomID]
        });
        results.rows.forEach(row => {
          // const media = Buffer.from(row.media).toString('base64');
          const media = row.media
          socket.emit('chat message', { media: media, msg: row.content }, row.id.toString());
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
}
