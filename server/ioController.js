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
    // process._rawDebug('keep func info');
    io._asyncInfo.push(funcInfoNode);
  }
}

function sendFuncInfo() {
  // process._rawDebug('send func info');
  io.emit('funcInfo', asyncInfoEmit);
  asyncInfoEmit = [];
}

ioController.sendPackageInfo = function(packageInfo){
  process._rawDebug('send package info');
  if(io._hasConnection){
    io.emit('packageInfo', packageInfo)
  } else {
    process._rawDebug('no connection')
  }
}

module.exports = ioController;
