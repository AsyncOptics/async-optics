

const socket = io.connect('http://localhost:3000');


socket.on('funcInfo', data => {
  console.log(data);
});

function showdata(data) {
  let testDiv = document.getElementsByTagName('body');
  // console.log(testDiv[0])
  data.forEach((funcInfoNode) => {
    let dataText = document.createTextNode(funcInfoNode.type);
    testDiv.appendChild(dataText)
  })
}
