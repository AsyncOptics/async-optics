const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.Server(app);
const io = socketio(server);


app.use( (req, res, next) => {
  process._rawDebug(req.method, req.url);
  next();
})

app.use(express.static('client'));

io.on('connection', (socket) => {
  process._rawDebug('New Socket Connection', socket.id);

  socket.on('disconnect', (reason) => {
    process._rawDebug('Socket Disonnect', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  process._rawDebug(`socket setup, listening to PORT ${PORT}`);
});

module.exports = io;
