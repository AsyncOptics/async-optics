const async_hooks = require('async_hooks');
const {performance, PerformanceObserver} = require('perf_hooks');
const funcInfo = require('./funcInfo/funcInfoModel.js');
const ioController = require('./server/ioController.js');

const hooks = {init: init, before: before, after: after, destroy: destroy};
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();

const activeAsyncProcess = new Map();

const ignoreType = ['Timeout','TIMERWRAP'];


function init(asyncId, type, triggerAsyncId, resource) {
  const err = new Error().stack;
  const errMessage = err.split('\n');
  const newErr = [];

  for(let i = 0; i < errMessage.length; i++){
    if(errMessage[i].includes('module.js') || 
      errMessage[i].includes('async_hooks') || 
      errMessage[i].includes('async_perf_hooks') || 
      errMessage[i].includes('Error') ||
      errMessage[i].includes('bootstrap_node')){
      continue;
    } else {
      newErr.push(errMessage[i])
    }
  }
    
  if(
    err.includes('ioController') ||
    err.includes('/alpha/node_modules/') ||
    err.includes('at AsyncHook.init (/Users/aturberv/testAlpha/node_modules/alpha/async_perf_hooks.js:32:17)') &&
    err.includes('at TCP.emitInitNative (internal/async_hooks.js:131:43)') 
    ){
    return;
  } else if(triggerAsyncId < 8 || activeAsyncProcess.get(triggerAsyncId)){

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
  // process._rawDebug(list.getEntries()[0]);
  const funcInfoEntries = list.getEntries()[0];
  const asyncId = Number(funcInfoEntries.name.split('-')[1]);
  const funcInfoNode = activeAsyncProcess.get(asyncId);
  funcInfoNode.duration = funcInfoEntries.duration;
  funcInfoNode.startTime = funcInfoEntries.startTime;
  funcInfoNode.endTime = funcInfoEntries.startTime + funcInfoEntries.duration;
  asyncInfoEmit.push(funcInfoNode);
  activeAsyncProcess.delete(asyncId);

  // observer.disconnect();
  asyncHook.disable();
  ioController.sendInfo(funcInfoNode);
  asyncHook.enable();
  // obs.observe({ entryTypes: ['measure','function'], buffered: false });
});
//entryTypes can be: 'node', 'mark', 'measure', 'gc', or 'function'
obs.observe({ entryTypes: ['measure','function'], buffered: false });
