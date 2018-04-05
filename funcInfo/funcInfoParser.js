const hist = {};
let counter = 0;
const DISPLAY_FREQ = 400;
let FSREQWRAP_COUNT = 0;
function funcInfoParser(asyncId, type, triggerAsyncId, resource, err) {
  // histDisplay(type);
  let shouldKeep = true;
  let resourceInfo = null;
  switch (type) {
    case 'TickObject':
      if (err.includes('/mongodb-core/lib/connection/pool.js:1246:15') ||    //ignore mongoose calling process.nextTick (_execute)
          err.includes('/mongodb-core/lib/connection/pool.js:552:17') ||
          err.includes('/mongodb-core/lib/connection/pool.js:540:24')) {
        shouldKeep = false;
        // ignore SOMEWHERE in mongoose keep calling process.nextTick, expecting related to connection
      } else if(err.includes('at process.nextTick (internal/process/next_tick.js:') &&
                err.includes('at maybeReadMore (_stream_readable.js:') && err.includes(':13') &&
                err.includes('at addChunk (_stream_readable.js:') && err.includes(':3') &&
                err.includes('at readableAddChunk (_stream_readable.js:') && err.includes(':11') &&
                err.includes('at Socket.Readable.push (_stream_readable.js:') && err.includes(':10') &&
                err.includes('at TCP.onread (net.js:') && err.includes(':20')) {
        shouldKeep = false;
      }
      break;
    case 'TIMERWRAP':
      // no information at all, Timer {}
      // process._rawDebug(type, resource);
      break;
    case 'Timeout':
      if (err.includes('at Connection.resetSocketTimeout') &&   // ignore mongoose keep calling setTimeout in resetSocketTimeout
          err.includes('mongodb-core/lib/connection/connection.js:188:21') ) {
        shouldKeep = false;
      } else {
        resourceInfo = {};
        resourceInfo.funcAwait = resource._onTimeout.toString();
        resourceInfo.delayTime = resource._idleTimeout;
        resourceInfo.timerArgs = resource._timerArgs;
      }
      break;
    case 'FSREQWRAP':
      if (FSREQWRAP_COUNT <= 2) {
          FSREQWRAP_COUNT++;
          shouldKeep = false;
          break;
      }
      process._rawDebug(type, asyncId, triggerAsyncId, resource.oncomplete);
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
  return newErr.join('\n');
}


module.exports = {funcInfoParser, errMessageParser};
