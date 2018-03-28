const hist = {};
let counter = 0;
const DISPLAY_FREQ = 0;
function funcInfoParser(asyncId, type, triggerAsyncId, resource) {
  histDisplay(type)

  switch (type) {
    case 'TickObject':
      // no useful information
      // process._rawDebug('CALLBACK******',resource.callback);
      process._rawDebug('ARGS******',resource.args);
      // process._rawDebug('DOMAIN******',resource.domain);
      break;
    case 'TIMERWRAP':
      // no information at all, Timer {}
      break;
    case 'TCPWRAP':
      // no information
      // TCP { reading: false, owner: null, onread: null, onconnection: null }
      break;
    default:

  }

  return;
}

function histDisplay(type) {
  if (hist[type] !== undefined) hist[type]++;
  else hist[type] = 1;
  counter++;
  if (counter >= DISPLAY_FREQ) {
    counter = 0;
    process._rawDebug('HIST',hist);
  }
  return;
}

function errMessageParser(errMessage) {
  const newErr = [];
  for (let i = 0; i < errMessage.length; i++) {
    if (errMessage[i].includes('module.js') ||
      errMessage[i].includes('async_hooks') ||
      errMessage[i].includes('async_perf_hooks') ||
      errMessage[i].includes('Error') ||
      errMessage[i].includes('bootstrap_node')) {
      continue;
    } else {
      newErr.push(errMessage[i]);
    }
  }
  return newErr;
}


module.exports = {funcInfoParser, errMessageParser};
