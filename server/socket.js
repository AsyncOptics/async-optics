const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path')

const app = express();
const server = http.Server(app);
const io = socketio(server);
io._hasConnection = false;
io._asyncInfo = [];

let numOfConnections = 0;

app.use( (req, res, next) => {
  // process._rawDebug(req.method, req.url);
  next();
})

// app.use(express.static('client'));
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  process._rawDebug('New Socket Connection', socket.id);
  numOfConnections++;
  io._hasConnection = true;
  // checkIdExist(20);
  process._rawDebug(io._hierarchyAggregate);
  socket.emit('packageInfo', io._hierarchyAggregate);


  if(io._asyncInfo.length !== 0) {
  	socket.emit('funcInfo', io._asyncInfo);
    // io._asyncInfo = [];
  }
  socket.on('disconnect', (reason) => {
    process._rawDebug('Socket Disonnect', socket.id);
    numOfConnections--;
    if (numOfConnections === 0) io._hasConnection = false;
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  process._rawDebug(`socket setup, listening to PORT ${PORT}`);
});






function checkIdExist(id) {
  for (let i=0; i<io._asyncInfo.length; i++) {
    if (io._asyncInfo[i].asyncId === id) {
      process._rawDebug(`asyncID ${id} EXIST`);
      return;
    }
  }
  process._rawDebug(`asyncID ${id} DOESN"T EXIST`);
  return;
};


module.exports = io;
