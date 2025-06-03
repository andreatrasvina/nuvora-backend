import { db } from './server/config/db.js';

await db.execute(`
  DROP TABLE IF EXISTS "messages";
`)

await db.execute(`
  DROP TABLE IF EXISTS "rooms";
`)

await db.execute(
  `CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        summary TEXT,
        image TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
);

await db.execute(
  `INSERT INTO rooms (name) VALUES("pictochat")`
);

await db.execute(
  `INSERT INTO rooms (name) VALUES("Planet Dolan")`
);

await db.execute(
  `INSERT INTO rooms (name) VALUES("Ena")`
);

