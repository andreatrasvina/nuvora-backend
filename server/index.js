import express from 'express';
import logger from 'morgan';

import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { setupChat } from './sockets/chat.js';
import { db } from './config/db.js';

const port = process.env.PORT ?? 3000;

const app = express(); //manejador de rutas http
const server = createServer(app); //el servidor http real, si hay peticion la manda a express para que el las maneje
const io = new Server(server, { //convierte el protocolo http a la conexion websocket despues del handshake
    connectionStateRecovery: {}
}); 

//middleware
app.use(logger('dev'));


//crear db
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
    )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    token TEXT,
    profile_picture TEXT
  )
`);
        

//ruta temporal jeje
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
});

//setup del chat
setupChat(io);

//iniciar server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});