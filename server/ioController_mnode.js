const {io, startServer} = require('./socket.js');
const ioController = {};

let asyncInfoEmit = [];
let sendInfoAnyway;

ioController.startServer = startServer;

ioController.sendInfo = function(funcInfoNode) {
  io._asyncInfo.push(funcInfoNode);
  if(io._hasConnection) {
    asyncInfoEmit.push(funcInfoNode);
    if (asyncInfoEmit.length > 59) {
      clearTimeout(sendInfoAnyway);
      sendFuncInfo(asyncInfoEmit);
    } else if (asyncInfoEmit.length > 0) {
      clearTimeout(sendInfoAnyway);
      sendInfoAnyway = setTimeout(sendFuncInfo, 1500);
    }
  } 
}

function sendFuncInfo() {
  io.emit('funcInfo', asyncInfoEmit);
  asyncInfoEmit = [];
}

module.exports = ioController;
