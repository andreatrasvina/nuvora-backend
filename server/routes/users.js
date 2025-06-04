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

//update
router.put('/update/:id', async (req, res) => {
  const { name, email, password, profile_picture } = req.body;
  const { id } = req.params;

  try {
    const fields = { name, email };

    const updates = [];
    const values = [];

    //foto de perfil
    if (profile_picture) {
      const cleanBase64 = profile_picture.replace(/^data:image\/\w+;base64,/, '');
      const base64Encoded = Buffer.from(cleanBase64, 'base64').toString('base64');
      fields.profile_picture = base64Encoded;
    }

    //texto
    for (const [key, value] of Object.entries(fields)) {
      if (value) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    //contarsena
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashed);
    }

    //envia algo
    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No actualizaste nada.'
      });
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    await db.execute({ sql, args: values });

    res.status(200).json({
      message: 'Usuario actualizado.'
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: 'Error al actualizae.'
    });
  }
});

export default router;
