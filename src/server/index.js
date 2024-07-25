const path = require('path');
const express = require('express');
const { createServer } = require('http');

const { Server } = require('socket.io');

const PORT = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join('src/public')));
app.get('/', (req, res) => {
});

io.on('connection', (socket) => {
  console.log('se ha conectado un usuario 🔌');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});



server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});