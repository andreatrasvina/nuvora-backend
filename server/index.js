import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import path from 'path'

import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url'


import { setupChat } from './sockets/chat.js';
import { db } from './config/db.js';

import authRoutes from './routes/auth.js';
import users from './routes/users.js';
import rooms from './routes/rooms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT ?? 3000;

const app = express(); //manejador de rutas http
const server = createServer(app); //el servidor http real, si hay peticion la manda a express para que el las maneje

// *******************************************************************
// ¡¡¡CAMBIO CLAVE AQUÍ: Define el origen de tu frontend Next.js!!!
// Tu error indica que es http://localhost:3001
// const FRONTEND_ORIGIN = 'http://localhost:3001';
const FRONTEND_ORIGIN = '*';
// *******************************************************************

const io = new Server(server, {
  // Configuración de CORS para Socket.IO
  cors: {
    origin: FRONTEND_ORIGIN, // <--- Importante: Permite el origen de tu frontend
    methods: ["GET", "POST"] // Métodos permitidos para el handshake de Socket.IO
  },
  connectionStateRecovery: {}
});

// middleware
app.use(logger('dev'));

// Configuración de CORS para Express (para tus rutas REST como /api/auth)
// Asegúrate de instalar 'cors': npm install cors
import cors from 'cors'; // <--- Importa 'cors'
app.use(cors({
  origin: FRONTEND_ORIGIN, // <--- Importante: Permite el origen de tu frontend
  credentials: true // Si manejas cookies o credenciales en tus rutas REST
}));
app.use('/uploads', express.static('uploads'))
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', users);
app.use('/api/rooms', rooms);

// await db.execute(`
//   DROP TABLE IF EXISTS "messages";
// `)
//
// await db.execute(`
//   DROP TABLE IF EXISTS "rooms";
// `)


await db.execute(
  `CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        summary TEXT,
        image TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
);

// await db.execute(
//   `INSERT INTO rooms (name) VALUES("pictochat")`
// );
//
// await db.execute(
//   `INSERT INTO rooms (name) VALUES("Planet Dolan")`
// );
//
// await db.execute(
//   `INSERT INTO rooms (name) VALUES("Ena")`
// );

await db.execute(
  `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        token TEXT,
        profile_picture TEXT
    )`
);

await db.execute(
  `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER DEFAULT 1,
        user_id INTEGER DEFAULT 1,
        content TEXT,
        media TEXT,
        mime_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(room_id) REFERENCES rooms(id)
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`
);

await db.execute(
  `CREATE TABLE IF NOT EXISTS user_rooms (
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`
);


// ruta temporal jeje
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

// esto es solamente para el cliente fake jijijiij
app.get('/rooms/:id', (req, res) => {
  res.sendFile(process.cwd() + '/client/rooms.html');
});

// esto es solamente para el cliente fake jijijiij
app.get('/test/', (req, res) => {
  res.sendFile(process.cwd() + '/client/image.html');
});



// setup del chat
setupChat(io);

// iniciar server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
