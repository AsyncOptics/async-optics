const async_hooks = require('async_hooks');
const {performance, PerformanceObserver} = require('perf_hooks');
const funcInfo = require('./funcInfo/funcInfoModel.js');
const {funcInfoParser, errMessageParser} = require('./funcInfo/funcInfoParser.js');
const ioController = require('./server/ioController_mnode.js');

console.log = process._rawDebug;
// Return the id of the current execution context. Useful for tracking state
// and retrieving the resource of the current trigger without needing to use an
// AsyncHook.
const cid = async_hooks.executionAsyncId();
// process._rawDebug('currentId',async_hooks.executionAsyncId(), 'triggerId',async_hooks.triggerAsyncId());
function asyncMonitor(portNumber) {
  ioController.startServer(portNumber);

  const hooks = {init: init, before: before, after: after, destroy: destroy};
  const asyncHook = async_hooks.createHook(hooks);
  asyncHook.enable();

  let previousTime = Date.now();
  const CHECK_DURATION = 10000;
  const activeAsyncProcess = new Map();
  const activeTimeTrack = new Map();
  const idDeleted = [];

  function check_ActiveTimeTrack() {
    activeTimeTrack.forEach( (initTime, id) => {
      if (initTime < previousTime) {
        activeTimeTrack.delete(id);
        const funcInfoNode = activeAsyncProcess.get(id);
        ioController.sendInfo(funcInfoNode);
      }
    });
    previousTime = Date.now();
    return;
  }


  setInterval(check_ActiveTimeTrack,CHECK_DURATION);

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
      idDeleted.push(id);
      activeTimeTrack.delete(id);
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
    const newErr = errMessageParser(errMessage);

    if(type === 'TCPSERVERWRAP' && triggerAsyncId === cid){
      const funcInfoNode = new funcInfo(asyncId, triggerAsyncId, type);
      funcInfoNode.errMessage = newErr;
      ioController.sendInfo(funcInfoNode);
    }

    if(resource.constructor.name === 'Socket' && resource.server && resource.server._connectionKey === `6::::${portNumber}`){
      deleteEntireBranch(triggerAsyncId);
      return;
    }

    if(resource.args && resource.args[0] && resource.args[0].url) {
      if(resource.args[0].url.includes('socket.io') && resource.args[0].socket.server._connectionKey === `6::::${portNumber}`) {
        deleteEntireBranch(triggerAsyncId);
        return;
      }
    }

    if(resource.args && resource.args[0] && resource.args[0].constructor.name === 'Socket'){
      if(resource.args[0].server && resource.args[0].server._connectionKey === `6::::${portNumber}`){
        deleteEntireBranch(triggerAsyncId);
        return;
      }
    }

    if( err.includes('ioController_mnode.js') ||
        err.includes('/async-optics/node_modules/') ||
        err.includes('/async-optics/packageMonitor.js') ||
        err.includes(`at AsyncHook.init (${__dirname}/asyncMonitor.js)`) &&
        err.includes('at TCP.emitInitNative (internal/async_hooks.js)') ) {
      return;
    } else if(triggerAsyncId < 8 || activeAsyncProcess.get(triggerAsyncId)) {
      const p = funcInfoParser(asyncId, type, triggerAsyncId, resource, newErr);
      if (p.shouldKeep) {
        const funcInfoNode = new funcInfo(asyncId, triggerAsyncId, type);
        funcInfoNode.errMessage = newErr;
        funcInfoNode.resourceInfo = p.resourceInfo;
        activeAsyncProcess.set(asyncId, funcInfoNode);
        activeTimeTrack.set(asyncId, Date.now());
        performance.mark(`${type}-${asyncId}-Init`);
      }
    }
    return;
  }

  function destroy(asyncId) {
    if (activeAsyncProcess.has(asyncId)) {
      const type = activeAsyncProcess.get(asyncId).type;
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
    activeTimeTrack.delete(asyncId);
    performance.clearMeasures(funcInfoEntries.name);
    performance.clearMarks(`${funcInfoEntries.name}-Init`);
    performance.clearMarks(`${funcInfoEntries.name}-Destroy`);

    ioController.sendInfo(funcInfoNode);
  });
  //entryTypes can be: 'node', 'mark', 'measure', 'gc', or 'function'
  obs.observe({ entryTypes: ['measure'], buffered: false });

  function before(asyncId) {}
  function after(asyncId) {}
}


module.exports = asyncMonitor;
