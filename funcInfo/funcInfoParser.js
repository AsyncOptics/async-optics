const hist = {};

function funcInfoParser(asyncId, type, resource) {
  if (hist[type] !== undefined) {
    hist[type]++;
  } else {
    hist[type] = 1;
  }


  switch (type) {
    case 'TickObject':
      // process._rawDebug(Object.keys(resource));
      // process._rawDebug('CALLBACK******',resource.callback);
      // process._rawDebug('ARGS******',resource.args);
      // process._rawDebug('DOMAIN******',resource.domain);
      break;
    case 'TCPWRAP':

      process._rawDebug(asyncId, resource);

      break;
    default:

  }
  process._rawDebug('HIST',hist);
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
