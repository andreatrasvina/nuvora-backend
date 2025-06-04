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
      console.log("message sent");
      let result
      const { media, msg, mime_type, user_id, name } = msg_wrapper
      // https://stackoverflow.com/questions/59478402/how-do-i-send-image-to-server-via-socket-io
      const media64 = Buffer.from(media).toString('base64')
      msg_wrapper.media = media64

      let messageTimestamp;

      try {
        result = await db.execute({
          sql: 'INSERT INTO messages (room_id, content, media, mime_type, user_id) VALUES (:room_id, :msg, :media, :mime_type, :user_id)',
          args: {
            room_id: roomID,
            msg: msg,
            media: media64,
            mime_type: mime_type,
            user_id: user_id
          }
        });

        const insertedMessage = await db.execute({
          sql: 'SELECT timestamp FROM messages WHERE id = ?',
          args: [result.lastInsertRowid],
        });
        messageTimestamp = insertedMessage.rows[0].timestamp;

      } catch (e) {
        console.error(e);
        return;
      }

      console.log('room message: ' + msg, media); //para verlos aki cerquita jeje
      io.to(roomID).emit(
        'chat message',
        { 
          msg: msg, 
          media: media64, 
          mime_type: mime_type, 
          user_id: user_id, 
          name: name,       
          timestamp: messageTimestamp 
        },
        result.lastInsertRowid.toString()
      ); //c propagan a todos los usuarios

    });

    //por si acaso.. recupera el msj
    if (!socket.recovered) {
      try {
        const query = `SELECT messages.id, messages.content, messages.media, messages.mime_type, messages.user_id FROM messages WHERE id > ? AND room_id = ?`
        const results = await db.execute({
          sql: `
          SELECT messages.id, messages.content, messages.media, messages.mime_type, messages.user_id, messages.timestamp, users.id, users.name
          FROM messages
          FULL OUTER JOIN users ON users.id=messages.user_id
          WHERE messages.id > ? AND messages.room_id = ?
          ORDER BY messages.timestamp ASC;`
          ,
          args: [socket.handshake.auth.serverOffset ?? 0, roomID]
        });
        results.rows.forEach(row => {
          // const media = Buffer.from(row.media).toString('base64');
          const media = row.media
          socket.emit('chat message', 
            { user_id: row.user_id, 
              name: row.name, 
              media: media, 
              msg: row.content, 
              mime_type: row.mime_type,
              timestamp: row.timestamp 
            }, row.id.toString());
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
}
