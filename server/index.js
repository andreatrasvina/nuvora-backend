import express from 'express';
import logger from 'morgan';
import dotenv from  'dotenv';
import { createClient } from '@libsql/client';

import { Server } from 'socket.io';
import { createServer } from 'node:http';

dotenv.config();

const port = process.env.PORT ?? 3000;

const app = express(); //manejador de rutas http
const server = createServer(app); //el servidor http real, si hay peticion la manda a express para que la maneje
const io = new Server(server, { //convierte el protocolo http a la conexion websocket despues del handshake
    connectionStateRecovery: {}
}); 

const db = createClient({
    url: "libsql://primary-rainmaker-andreatrasvina.aws-us-west-2.turso.io",
    authToken: process.env.DB_TOKEN,
});

await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
    )
`);

//responde a la accion cuando un usuario se ha conectado
io.on('connection', (socket) => {
    console.log('a user has connected!!');
    
    //responde a la accion cuando un usuario se ha desconectado
    socket.on('disconnect', () => {
        console.log('an user has disconnected');
    });

    //responde a la accion cuando un usuario envia un mensaje
    socket.on('chat message', async (msg) => {

        let result

        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content) VALUES (:msg)',
                args: { msg }
            });
        } catch (e) {
            console.error(e);
            return;
        }
        
        console.log('message: ' + msg); //para verlos aki cerquita jeje
        io.emit('chat message', msg, result.lastInsertRowid.toString());
    });
});

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});