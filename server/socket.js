const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path')

const app = express();
const server = http.Server(app);
const io = socketio(server);
io._hasConnection = false;
io._asyncInfo = [];

app.use( (req, res, next) => {
  process._rawDebug(req.method, req.url);
  next();
})

// app.use(express.static('client'));
app.use(express.static(path.join(__dirname, '../client')));
io.on('connection', (socket) => {
  process._rawDebug('New Socket Connection', socket.id);
  io._hasConnection = true;
  if(io._asyncInfo.length !== 0) {
  	socket.emit('funcInfo', io._asyncInfo);
    io._asyncInfo = [];
  }

  // socket.on('packageInfo', (data) => {
  //   console.log('packageInfo')
  //   socket.emit('packageInfo', data)
  // })

  socket.on('disconnect', (reason) => {
    process._rawDebug('Socket Disonnect', socket.id);
    io._hasConnection = false;
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  process._rawDebug(`socket setup, listening to PORT ${PORT}`);
});

module.exports = io;
