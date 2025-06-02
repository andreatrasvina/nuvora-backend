import { Router } from 'express';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '../config/db.js';

const router = Router();

// show user
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE id = ?`,
      args: [id],
    });

    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    res.status(200).json({
      message: 'Consulta de usuario exitosa',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
      }
    });

  } catch (e) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// get all users
router.get('/', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users`,
    });

    if (!result.rows) return res.status(404).json({ message: 'No hay usuarios unu.' });

    res.status(200).json({
      message: 'Consulta de usuarios exitosa',
      users: result.rows
    });

  } catch (e) {
    // console.error(e);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

export default router;
