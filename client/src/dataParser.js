const CORE_THRESHOLD = 8;
const remainData = {}; //key is the id, value is arr contains all funcNode trggered by this id
const checklist_flat = {}; //key is the id, value is index of that funcNode in flatData, keep track data in flatData
const flatData = [];  //data to show


flatData.push({
  asyncId: 'Node.js core',
  triggerAsyncId: null,
  type: 'SYSTEM',
  startTime: 0,
  duration: 0,
  errMessage: 'Node.js core'
});

function parseData(data) {
  let needToRefresh = false;
  data.sort( (a,b) => {
    return b.asyncId - a.asyncId;
  });

  let n = data.length;
  while (n > 0) {
    const funcNode = data.pop();
    const triggerAsyncId = funcNode.triggerAsyncId;
    const asyncId = funcNode.asyncId;
    // console.log(asyncId, triggerAsyncId, funcNode.type);
    if (triggerAsyncId < CORE_THRESHOLD || checklist_flat[triggerAsyncId] >= 0) {
      if (triggerAsyncId < CORE_THRESHOLD) funcNode.triggerAsyncId = 'Node.js core';
      if (checklist_flat[asyncId] >= 0) {
        needToRefresh = true;
        flatData[checklist_flat[asyncId]] = funcNode;
      } else {      
        needToRefresh = true;
        checklist_flat[asyncId] = flatData.length;
        flatData.push(funcNode);
        getfromRemainData(asyncId);
      }
    } else { // the trigger func node is not received yet~
      putIntoRemainData(funcNode);
    }
    n--;
  }
  return needToRefresh;
}


function getfromRemainData(id) {
  if (remainData[id]) { //
    for (let i=0; i<remainData[id].length; i++) {
      const funcNode = remainData[id][i];
      checklist_flat[funcNode.asyncId] = flatData.length;
      flatData.push(funcNode);
      getfromRemainData(remainData[id][i].asyncId);
    }
    delete remainData[id]
    // remainData[id] = null;
  }
  return;
}

function putIntoRemainData(funcNode) {
  const id = funcNode.triggerAsyncId;
  let update = false;
  if (!remainData[id])  {
    remainData[id] = [];
  }
  for (let i=0; i<remainData[id].length; i++) {
    if (remainData[id][i].asyncId === funcNode.asyncId) {
      remainData[id][i] = funcNode;
      update = true;
      break;
    }
  }
  if (!update) remainData[id].push(funcNode);
  return;
}
