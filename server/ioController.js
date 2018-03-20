const io = require('./socket.js');
const ioController = {};

let sendInfoAnyway;
ioController.sendInfo = function(asyncInfoEmit, obs) {
  if (asyncInfoEmit.length > 19) {
    clearTimeout(sendInfoAnyway);
    sendFuncInfo(asyncInfoEmit);
  } else {
    // process._rawDebug('asyncInfoEmit');
    clearTimeout(sendInfoAnyway);
    sendInfoAnyway = setTimeout(sendFuncInfo, 1000, asyncInfoEmit)
  }
  // obs.observe({ entryTypes: ['measure','function'], buffered: false });
}

function sendFuncInfo(asyncInfoEmit) {
  // process._rawDebug('send func info', io.emit)
  if(io.connected){
    process._rawDebug('connectedd')
    io.emit('funcInfo', asyncInfoEmit)
    asyncInfoEmit = [];
  } else {
    global.asyncInfo = asyncInfoEmit  
  }
}

module.exports = ioController;
