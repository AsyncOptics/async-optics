const async_hooks = require('async_hooks');
const {performance, PerformanceObserver} = require('perf_hooks');
const funcInfo = require('./funcInfo/funcInfoModel.js');
const ioController = require('./server/ioController.js');

const hooks = {init: init, before: before, after: after, destroy: destroy};
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable()

const activeAsyncProcess = new Map();
let asyncInfoEmit = [];
const ignoreType = ['Timeout','TIMERWRAP'];


function init(asyncId, type, triggerAsyncId, resource) {
  switch(type) {
    case 'TickObject':
      if(resource.args && resource.args[0].constructor.name === 'WriteStream') return destroy(asyncId)
      asyncHook.disable()
      break;
    case 'Timeout':
      if(resource._timerArgs && resource._timerArgs[0][0].constructor.name === 'funcInfo') return destroy(asyncId)
      asyncHook.disable()
      break;
    default:
      // process._rawDebug('default', resource)
    }
      // process._rawDebug('look4socket', type, resource.callback, resource.args ? resource.args.server : resource)
  // if (!ignoreType.includes(type)) {
    // process._rawDebug('INIT', type, asyncId, triggerAsyncId, resource);
    // process._rawDebug('INIT', type, asyncId, triggerAsyncId);
    const err = new Error().stack;
    const errMessage = err
    if(errMessage.includes('ioController' || 'async_perf_hooks' )) return destroy(asyncId)
    // process._rawDebug(err.split('\n').slice(3).join('\n'));
    const funcInfoNode = new funcInfo(asyncId, triggerAsyncId, type);
    funcInfoNode.errMessage = errMessage;
    activeAsyncProcess.set(asyncId, funcInfoNode);
    performance.mark(`${type}-${asyncId}-Init`);
  // }
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
    process._rawDebug('DESTROY',asyncId);
    process._rawDebug(activeAsyncProcess.keys());
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
  asyncInfoEmit.push(funcInfoNode);
  activeAsyncProcess.delete(asyncId);

  // observer.disconnect();
  ioController.sendInfo(asyncInfoEmit,obs);
  // process._rawDebug(activeAsyncProcess);

  // obs.observe({ entryTypes: ['measure','function'], buffered: false });

  // if (activeAsyncProcess.size === 1) {
  //   performance.clearMarks();
  //   performance.clearMeasures();
  //
  // }
});
//entryTypes can be: 'node', 'mark', 'measure', 'gc', or 'function'
obs.observe({ entryTypes: ['measure','function'], buffered: false });
