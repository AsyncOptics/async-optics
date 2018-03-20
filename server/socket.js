const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path')

const app = express();
const server = http.Server(app);
const io = socketio(server);


app.use( (req, res, next) => {
  process._rawDebug(req.method, req.url);
  next();
})

app.get('/', (req, res, next) => {
	// res.contentType('text/js') 
	res.sendFile(path.join(__dirname, '../index.html'))
})

app.get('/test.js', (req, res, next) => {
	res.contentType('text/javascript')
	res.sendFile(path.join(__dirname, '../test.js'))
})

io.on('connection', (socket) => {
  process._rawDebug('New Socket Connection', socket.id);
  socket._tagName = 'MNodejs'
  if(global.asyncInfo) {
  	socket.emit('funcInfo', global.asyncInfo)
  }
  socket.on('disconnect', (reason) => {
    process._rawDebug('Socket Disonnect', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  process._rawDebug(`socket setup, listening to PORT ${PORT}`);
});

module.exports = io;
