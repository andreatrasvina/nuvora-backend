import { Router } from 'express';
import { db } from '../config/db.js';

const router = Router();

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
    // console.error(e);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
})
export default router;
