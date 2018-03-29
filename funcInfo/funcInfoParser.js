const hist = {};
let counter = 0;
const DISPLAY_FREQ = 100;

function funcInfoParser(asyncId, type, triggerAsyncId, resource, err) {
  histDisplay(type);
  let shouldKeep = true;
  let resourceInfo = null;
  switch (type) {
    case 'TickObject':
      // process._rawDebug('CALLBACK******',resource.callback); //not useful
      // process._rawDebug('ARGS******',resource.args);         // too much info
      // process._rawDebug('DOMAIN******',resource.domain);     // null
      break;
    case 'TIMERWRAP': // can be ignored ?!
      // no information at all, Timer {}
      // process._rawDebug(type, resource);
      break;
    case 'Timeout':
      resourceInfo = {};
      resourceInfo.funcAwait = resource._onTimeout.toString();
      resourceInfo.delayTime = resource._idleTimeout;
      resourceInfo.timerArgs = resource._timerArgs;
      break;
    case 'FSREQWRAP':
      process._rawDebug(type, asyncId, triggerAsyncId, err);
      break;
    case 'TCPWRAP':
      // no information, but can trigger other events with information
      // TCP { reading: false, owner: null, onread: null, onconnection: null }
      break;
    case 'HTTPPARSER':
      // process._rawDebug(type, resource[1]);
      // process._rawDebug(err);
      break;
    default:

  }

  return {shouldKeep,resourceInfo};
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
