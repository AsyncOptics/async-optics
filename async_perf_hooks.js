const async_hooks = require('async_hooks');
const {performance, PerformanceObserver} = require('perf_hooks');

const active = new Map();

const hooks = {init: init, before: before, after: after, destroy: destroy};
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable()

function init(asyncId, type, triggerAsyncId, resource) {
  process._rawDebug('INIT', type, asyncId, triggerAsyncId, resource);
  // process._rawDebug('INIT', type, asyncId, triggerAsyncId);
  if (type) {
    performance.mark(`${type}-${asyncId}-Init`);
    active.set(asyncId, type);
  }
}

function before(asyncId) {
  process._rawDebug('BEFORE',asyncId);
}

function after(asyncId) {
  process._rawDebug('AFTER', asyncId);
}

function destroy(asyncId) {
  if (active.has(asyncId)) {
    const type = active.get(asyncId);
    process._rawDebug(active);
    process._rawDebug('DESTROY',asyncId);
    performance.mark(`${type}-${asyncId}-Destroy`);
    performance.measure(`${type}-${asyncId}`,
                        `${type}-${asyncId}-Init`,
                        `${type}-${asyncId}-Destroy`);
    active.delete(asyncId);
  }
}

const obs = new PerformanceObserver((list, observer) => {
  process._rawDebug(list.getEntries());
  // if (active.size === 1) {
  //   performance.clearMarks();
  //   performance.clearMeasures();
  //   observer.disconnect();
  // }
});

obs.observe({ entryTypes: ['measure','function'], buffered: false });
