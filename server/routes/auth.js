import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '../config/db.js';

const router = Router();

//register
router.post('/register', async(req, res) => {
  const { name, email, password, profile_picture } = req.body;

  if(!name || !email || !password) {
    return res.status(400).json({
      message: 'Campos requeridos: nombre, correo y contraseña.'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute({
      sql: `
      INSERT INTO users (name, email, password, profile_picture)
      VALUES (?, ?, ?, ?)
      `,
      args: [name, email, hashedPassword, profile_picture ?? null],
    });

    res.status(200).json({
      message: 'Usuario registrado correctamente.'
    });

  }catch(e){

    if(e.message.includes('UNIQUE')) {
      res.status(400).json({
        message: 'Este correo ya ha sido registrado.'
      });
    }else{
      console.log(e);
      res.status(500).json({
        message: 'Error en el mugroso servidor.'
      });
    }
  }
});


//login
router.post('/login', async(req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email],
    });

    const user = result.rows[0];

    if(!user) return res.status(404).json({message: 'Usuario no encontrado.'});

    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return res.status(400).json({message: 'Contraseña incorrecta.'});

    const token = randomUUID();

    await db.execute({
      sql: `UPDATE users SET token = ? WHERE id = ?`,
      args: [token, user.id],
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
      }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

//logout
router.post('/logout', async (req, res) => {
  const { token } = req.body;

  try {
    await db.execute({
      sql: `UPDATE users SET token = NULL WHERE token = ?`,
      args: [token],
    });
  
    res.status(200).json({ message: 'Sesión cerrada.' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al cerrar sesión.' });
  }
});

//update
router.put('/update/:id', async (req, res) => {
  const { name, email, password, profile_picture } = req.body;
  const { id } = req.params;

  try {
    const fields = { name, email, profile_picture };

    const updates = [];
    const values = [];

    //opcional
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