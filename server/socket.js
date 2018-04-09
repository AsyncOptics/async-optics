const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.Server(app);
const io = socketio(server);
io._hasConnection = false;
io._asyncInfo = [];

let numOfConnections = 0;

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  numOfConnections++;
  io._hasConnection = true;
  socket.emit('packageInfo', io._hierarchyAggregate);

  if(io._asyncInfo.length !== 0) {
  	socket.emit('funcInfo', io._asyncInfo);
  }
  socket.on('disconnect', (reason) => {
    numOfConnections--;
    if (numOfConnections === 0) io._hasConnection = false;
  });
});

function startServer(portNumber) {
  if (!portNumber) portNumber = 3000;
  const scriptStr = `const socket = io.connect('http://localhost:${portNumber}');`;
  fs.writeFile(path.join(__dirname,'../client/src/main.js'), scriptStr, (err) => {
    if (err) throw err;
    server.listen(portNumber, () => {
      process._rawDebug(`async-optics socket setup, listening to PORT ${portNumber}`);
    });
  })
}

module.exports = {io, startServer};
