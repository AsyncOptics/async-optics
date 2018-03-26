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
      if (asyncId === 34) {
        // process._rawDebug(Object.keys(resource));
        // process._rawDebug(resource);
      }
      process._rawDebug(Object.keys(resource));
      process._rawDebug(resource);
      // process._rawDebug(Object.keys(resource));
      // process._rawDebug('CALLBACK******',resource.callback);
      // process._rawDebug('ARGS******',resource.args);
      // process._rawDebug('DOMAIN******',resource.domain);
      break;
    default:

  }
  process._rawDebug('HIST',hist);
  return;
}





module.exports = {funcInfoParser};
