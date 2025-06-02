import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';

import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { setupChat } from './sockets/chat.js';
import { db } from './config/db.js';

import authRoutes from './routes/auth.js';
import authUsers from './routes/users.js';

dotenv.config();

const port = process.env.PORT ?? 3000;

const app = express(); //manejador de rutas http
const server = createServer(app); //el servidor http real, si hay peticion la manda a express para que el las maneje

// *******************************************************************
// ¡¡¡CAMBIO CLAVE AQUÍ: Define el origen de tu frontend Next.js!!!
// Tu error indica que es http://localhost:3001
const FRONTEND_ORIGIN = 'http://localhost:3001';
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

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', authUsers);

// crear db
await db.execute(
  `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
);

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

// ruta temporal jeje
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

// setup del chat
setupChat(io);

// iniciar server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
