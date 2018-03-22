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
  // if (!ignoreType.includes(type)) {
  if (triggerAsyncId && type) {
    // process._rawDebug('INIT', type, asyncId, triggerAsyncId, resource);
    process._rawDebug('INIT', type, asyncId, triggerAsyncId);
    const err = new Error().stack;
    process._rawDebug(err);
    const errMessage = err.split('\n').slice(3).join('\n');
    // process._rawDebug(err.split('\n').slice(3).join('\n'));
    const funcInfoNode = new funcInfo(asyncId, triggerAsyncId, type);
    funcInfoNode.errMessage = errMessage;
    activeAsyncProcess.set(asyncId, funcInfoNode);
    performance.mark(`${type}-${asyncId}-Init`);
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
  activeAsyncProcess.delete(asyncId);

  // observer.disconnect();
  asyncHook.disable();
  ioController.sendInfo(funcInfoNode);
  asyncHook.enable();
  // obs.observe({ entryTypes: ['measure','function'], buffered: false });
});
//entryTypes can be: 'node', 'mark', 'measure', 'gc', or 'function'
obs.observe({ entryTypes: ['measure','function'], buffered: false });
