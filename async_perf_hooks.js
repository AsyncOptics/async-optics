const async_hooks = require('async_hooks');
const {performance, PerformanceObserver} = require('perf_hooks');
const funcInfo = require('./funcInfo/funcInfoModel.js');
const ioController = require('./server/ioController.js');

// Return the id of the current execution context. Useful for tracking state
// and retrieving the resource of the current trigger without needing to use an
// AsyncHook.

// Return the id of the resource responsible for triggering the callback of the
// current execution scope to fire.
const cid = async_hooks.currentId();
// process._rawDebug('currentId',async_hooks.currentId(),'  triggerId',async_hooks.triggerId());

const hooks = {init: init, before: before, after: after, destroy: destroy};
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();

const activeAsyncProcess = new Map();

function deleteEntireBranch(triggerAsyncId) {
  if (triggerAsyncId < 7) return;
  const rootAsyncId = findRootId(triggerAsyncId)
  deleteThisBranch(rootAsyncId);

  function deleteThisBranch(id) { // delete branch based on root async id ,won't catch the broken subbranch if middle nodes are missing
    activeAsyncProcess.forEach((funcNode, asyncId) => {
      if (funcNode.triggerAsyncId === id) {
        deleteThisBranch(asyncId);
      }
    });
    activeAsyncProcess.delete(id);
    return;
  }

  function findRootId(asyncId) {
    let rootId = asyncId;
    let funcNode = activeAsyncProcess.get(asyncId);
    while (funcNode && funcNode.triggerAsyncId>=7) {
      rootId = funcNode.triggerAsyncId;
      funcNode = activeAsyncProcess.get(rootId);
    }
    return rootId;
  }
}


function init(asyncId, type, triggerAsyncId, resource) {
  const err = new Error().stack;
  const errMessage = err.split('\n');
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

  if(type === 'TCPSERVERWRAP' && triggerAsyncId === cid){
    const funcInfoNode = new funcInfo(asyncId, triggerAsyncId, type);
    funcInfoNode.errMessage = newErr.join('\n');
    funcInfoNode.startTime = 0;
    funcInfoNode.duration = 0;
    ioController.sendInfo(funcInfoNode);
  }

  if(resource.constructor.name === 'Socket' && resource.server && resource.server._connectionKey === '6::::3000'){
    deleteEntireBranch(triggerAsyncId);
  }

  if(resource.args && resource.args[0].url){
    if(resource.args[0].url.includes('socket.io') && resource.args[0].socket.server._connectionKey === '6::::3000'){
      deleteEntireBranch(triggerAsyncId);
    }
  }

  if(resource.args && resource.args[0].constructor.name === 'Socket'){
    if(resource.args[0].server && resource.args[0].server._connectionKey === '6::::3000'){
      deleteEntireBranch(triggerAsyncId);
    }
  }

  if(type === 'GETADDRINFOREQWRAP' || resource.constructor.name === 'Socket' && resource.hostname === 'ds249798.mlab.com'){
    deleteEntireBranch(triggerAsyncId);
  }
  //from ourOwncode
  if( err.includes('ioController') ||
      err.includes('/alpha/node_modules/') ||
      err.includes(`at AsyncHook.init (${__dirname}/async_perf_hooks.js)`) &&
      err.includes('at TCP.emitInitNative (internal/async_hooks.js:131:43)') ) {
    return;
  } else if(triggerAsyncId < 8 || activeAsyncProcess.get(triggerAsyncId)) {
    // process._rawDebug('INIT', type, asyncId, triggerAsyncId, resource);
    const funcInfoNode = new funcInfo(asyncId, triggerAsyncId, type);
    funcInfoNode.errMessage = newErr.join('\n');
    activeAsyncProcess.set(asyncId, funcInfoNode);
    performance.mark(`${type}-${asyncId}-Init`);
  } else {
    return;
  }
}

function before(asyncId) {
  // process._rawDebug('BEFORE',asyncId);
}
function after(asyncId) {
  // process._rawDebug('AFTER', asyncId);
}

function destroy(asyncId) {
  if (activeAsyncProcess.has(asyncId)) {
    const type = activeAsyncProcess.get(asyncId).type;
    // process._rawDebug('DESTROY',asyncId);
    // process._rawDebug(activeAsyncProcess.keys());
    performance.mark(`${type}-${asyncId}-Destroy`);
    performance.measure(`${type}-${asyncId}`,
                        `${type}-${asyncId}-Init`,
                        `${type}-${asyncId}-Destroy`);
  }
}

const obs = new PerformanceObserver((list, observer) => {
  const funcInfoEntries = list.getEntries()[0];
  const asyncId = Number(funcInfoEntries.name.split('-')[1]);
  const funcInfoNode = activeAsyncProcess.get(asyncId);
  funcInfoNode.duration = funcInfoEntries.duration;
  funcInfoNode.startTime = funcInfoEntries.startTime;
  funcInfoNode.endTime = funcInfoEntries.startTime + funcInfoEntries.duration;

  activeAsyncProcess.delete(asyncId);
  performance.clearMeasures(funcInfoEntries.name);
  performance.clearMarks(`${funcInfoEntries.name}-Init`);
  performance.clearMarks(`${funcInfoEntries.name}-Destroy`);

  ioController.sendInfo(funcInfoNode);
});
//entryTypes can be: 'node', 'mark', 'measure', 'gc', or 'function'
obs.observe({ entryTypes: ['measure','function'], buffered: false });
