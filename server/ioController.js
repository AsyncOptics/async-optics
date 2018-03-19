const io = require('./socket.js');
const ioController = {};

let sendInfoAnyway;
ioController.sendInfo = function(asyncInfoEmit) {
  if (asyncInfoEmit.length > 19) {
    clearTimeout(sendInfoAnyway);
    sendFuncInfo(asyncInfoEmit);
  } else {
    process._rawDebug('asyncInfoEmit');
    clearTimeout(sendInfoAnyway);
    sendInfoAnyway = setTimeout(sendFuncInfo, 1000, asyncInfoEmit)
  }
}

function sendFuncInfo(asyncInfoEmit) {
  io.emit('funcInfo', asyncInfoEmit);
  asyncInfoEmit = [];
}

module.exports = ioController;
