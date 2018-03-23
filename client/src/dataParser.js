const remainData = {}; //key is the id, value is arr contains all func trggered by the id
const checklist_flat = {}; //key is the id, value is true,keep track for flatData

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
  data.sort( (a,b) => {
    return b.asyncId - a.asyncId;
  });
  let n = data.length;
  while (n > 0) {
    const funcNode = data.pop();
    const triggerAsyncId = funcNode.triggerAsyncId;
    const asyncId = funcNode.triggerAsyncId;
    if (triggerAsyncId < 8 || checklist_flat[triggerAsyncId]) {
      if (triggerAsyncId < 8) funcNode.triggerAsyncId = 'Node.js core';
      checklist_flat[asyncId] = true;
      flatData.push(funcNode);
      getfromRemainData(asyncId);
    } else { // the trigger func node is not received yet~
      putIntoRemainData(funcNode);
    }
    n--;
  }

  return flatData;
}

function getfromRemainData(id) {
  if (remainData[id]) { //
    for (let i=0; i<remainData[id].length; i++) {
      flatData.push(remainData[id][i]);
      getfromRemainData(remainData[id][i].asyncId);
    }
    remainData[id] = null;
  }
  return;
}

function putIntoRemainData(funcNode) {
  const id = funcNode.triggerAsyncId;
  if (!remainData[id])  {
    remainData[id] = [];
  }
  remainData[id].push(funcNode);
  return;
}



// var flatData = [
//   {"name": "Top Level", "parent": null},
//   {"name": "Level 2: A", "parent": "Top Level" },
//   {"name": "Level 2: B", "parent": "Top Level" },
//   {"name": "Son of A", "parent": "Level 2: A" },
//   {"name": "Daughter of A", "parent": "Level 2: A" }
// ];
