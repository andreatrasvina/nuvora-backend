import { Router } from 'express';
import { createClient } from '@libsql/client';
import { db } from '../config/db.js';
import multer from 'multer'

const router = Router();

// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => {
//     console.log('hellope', file);
//     cb(null, file.originalname)
//   }
// });

const upload = multer({})

router.get('/', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM rooms`,
    });

    if (!result.rows) return res.status(404).json({ message: 'No hay salas unu.' });

    res.status(200).json({
      message: 'Consulta de salas exitosa',
      rooms: result.rows
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// TODO: make this db query to check if the requested room id is associated with the user id, which also will be sent
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: `SELECT * FROM rooms where id = ?`,
      args: [id],
    });

    if (!result.rows.length) return res.status(404).json({ message: 'No existe esta sala.' });

    res.status(200).json({
      message: 'Consulta de salas exitosa',
      room: result.rows[0]
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});


router.post('/create-room', async function(req, res, next) {
  const { name, summary, image } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: 'El nombre de la sala es obligatorio.'
    });
  }

  let base64ImageToStore = null;

  if (image) {
    try {
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
      base64ImageToStore = cleanBase64;
    } catch (e) {
      console.error("Error al procesar la imagen Base64 para la sala:", e);
      return res.status(400).json({ message: "Formato de imagen invalido." });
    }
  }

  try {
    const result = await db.execute({ //guarda el resultado para obtener el id
      sql: `
      INSERT INTO rooms (name, summary, image)
      VALUES (?, ?, ?)
      `,
      args: [name, summary, base64ImageToStore],
    });

    const newRoomId = result.lastInsertRowid;

    res.status(200).json({
      message: 'Sala creada correctamente.',
      roomId: newRoomId.toString()
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: 'Error al crear la sala en el servidor.'
    });
  }
});

//unirse a sala
router.post('/join-room', async (req, res) => {
  const { userId, roomId } = req.body;

  try {
    await db.execute({
      sql: `INSERT INTO user_rooms (user_id, room_id) VALUES (?, ?)`,
      args: [userId, roomId],
    });

    res.status(200).json({ message: 'Te has unido a la sala correctamente.' });

  } catch (e) {
    
    if (e.message.includes('Ya estas en esta sala')) { 
      return res.status(409).json({ message: 'Ya eres miembro de esta sala.' });
    }

    console.error(e);
    res.status(500).json({ message: 'Error al unirte a la sala.' });
  }
});


//obtener las salas unidas del usuario
router.get('/user-rooms/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.execute({
      sql: `
        SELECT r.id, r.name, r.summary, r.image
        FROM rooms r
        JOIN user_rooms ur ON r.id = ur.room_id
        WHERE ur.user_id = ?
      `,
      args: [userId],
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({ message: 'El usuario no se ha unido a ninguna sala.', rooms: [] });
    }

    res.status(200).json({
      message: 'Consultas exitosas',
      rooms: result.rows
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al obtener salas del usuario.' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM messages`,
    });

    if (!result.rows) return res.status(404).json({ message: 'No hay mensajes unu.' });

    res.status(200).json({
      message: 'Consulta de salas exitosa',
      messages: result.rows
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});


export default router;
