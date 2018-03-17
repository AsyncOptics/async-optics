const async_perf_hooks = require('./async_perf_hooks.js');
const fs = require('fs');









let a=1;
setTimeout(()=>{a++;},399);

//
// fs.writeFile('sick.json','hello world!!!', (err) => {
//   if (err) console.log('ERR');
//   process._rawDebug('write done');
//   // console.log(process._getActiveHandles());
// })
