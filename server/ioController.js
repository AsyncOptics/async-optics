const io = require('./socket.js');
const ioController = {};
// const infoSaved = [];

let asyncInfoEmit = [];
let sendInfoAnyway;
ioController.sendInfo = function(funcInfoNode) {
  if(io._hasConnection) {
    asyncInfoEmit.push(funcInfoNode);
    if (asyncInfoEmit.length > 59) {
      clearTimeout(sendInfoAnyway);
      sendFuncInfo(asyncInfoEmit);
    } else if (asyncInfoEmit.length > 0) {
      clearTimeout(sendInfoAnyway);
      sendInfoAnyway = setTimeout(sendFuncInfo, 2000);
    }
  } else {
    process._rawDebug('keep func info');
    io._asyncInfo.push(funcInfoNode);
  }
}

function sendFuncInfo() {
  process._rawDebug('send func info');
  io.emit('funcInfo', asyncInfoEmit);
  asyncInfoEmit = [];
}

module.exports = ioController;
