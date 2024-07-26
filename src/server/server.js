const path = require('path');
const express = require('express');
const { createServer } = require('http');
require('dotenv').config();
const { createClient } = require('@libsql/client');

const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const app = express();
const server = createServer(app);
const io = new Server(server,
  {connectionStateRecovery:{} 
});

//**Database management for persistance----------------------------------
const db = createClient({
  url: "libsql://touched-whirlwind-ulifly.turso.io",
  authToken: process.env.DB_TOKEN
})

async function startServer(){
  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT
    )
  `)
}
startServer();

//**--------------------------------------------------------------------- */




//** manage socket.io connection--------------------------------------------/
app.use(express.static(path.join('src/public')));
app.get('/', (req, res) => {
});

io.on('connection', async (socket) => {
  console.log('se ha conectado un usuario 🔌');

  socket.on('chat message', async (msg) => {
    let result
    try {
      result = await db.execute({ 
        sql: 'INSERT INTO messages (content) VALUES (:msg)',
        args: { msg }
      });
    } catch (e) {
      console.error(e);
      return
    }

    io.emit('chat message', msg, result.lastInsertRowid.toString());
  });
  
  if (!socket.recovered){
    try{
      const results = await db.execute({
        sql: 'SELECT id, content FROM messages WHERE id > ?',
        args: [socket.handshake.auth.serverOffset ?? 0] 
     })

     results.rows.forEach(row=>{
      socket.emit('chat message', row.content, row.id.toString());
     })

     
    }catch(e){
      console.error(e);
      return
    }
  }


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


//*-------------------------------------------------------------------------


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});