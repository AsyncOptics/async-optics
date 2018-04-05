const mnode = {};
mnode.asyncMonitor = require('./async_perf_hooks.js')
mnode.pkgMonitor = require('./packageMonitor.js')

module.exports = mnode;


const asyncMonitor = require('./async_perf_hooks.js')
const pkgMonitor = require('./packageMonitor.js')

module.exports = {asyncMonitor, pkgMonitor};
