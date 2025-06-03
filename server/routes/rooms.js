import { Router } from 'express';
import { db } from '../config/db.js';
import multer from 'multer'
import path from 'path'

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
})

router.post('/', upload.single('image_field'), async function(req, res, next) {
  const { name, summary } = req.body
  // const imagePath = `${process.env.SERVER_URI}${req.file.path}`

  try {
    await db.execute({
      sql: `
      INSERT INTO rooms (name, summary, image)
      VALUES (?, ?, ?)
      `,
      args: [name, summary, image64],
    });
    res.status(200).json({
      message: 'Sala creada correctamente.'
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Error en el mugroso servidor.'
    });
  }
})

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
})


export default router;
