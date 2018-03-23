const socket = io.connect('http://localhost:3000');


socket.on('funcInfo', data => {
  parseData(data);
  // flatData.sort((a,b) => {
  //   return a.asyncId - b.asyncId;
  // })
  console.log(flatData);  // from dataParser.js file
  const inputData = d3.stratify()
                      .id( (d) => { return d.asyncId; })
                      .parentId( (d) => { return d.triggerAsyncId; })
                      (flatData);
  inputData.each((d) => { d.name = d.id; });
  // console.log(inputData);
  refreshTree(inputData);
});

// convert the flat data into a hierarchy

//
// // assign the name to each node
// treeData.each(function(d) {
//     d.name = d.id;
//   });


const margin = {top: 20, right: 90, bottom: 30, left: 90};
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let i = 0;
let duration = 750;
let root;
let nodes;
let counter = 0;
let treeData = {};

const svg = d3.select("#tree")
              .append("svg")
              .attr("width", width + margin.right + margin.left)
              .attr("height", height + margin.top + margin.bottom)

const g = svg.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const tree = d3.tree()
               .size([width, height]);

const div = d3.select("body")
              .append("div")
              .attr("class", "tooltip")
              .style("opacity", 0);



function refreshTree(inputData) {
  // console.log(newsource);
  root = d3.hierarchy(inputData, d => d.children );
  // console.log(root);
  root.x0 = 0;
  root.y0 = width/2;
  update(root);
}


// leaving this global so i can mess with it in the console


function update(source){
  let treeData = tree(root);
  nodes = treeData.descendants();
  // console.log(root);
  let links = treeData.descendants().slice(1);

    // ****************** Nodes section ***************************
    // Update the nodes...
  node = g.selectAll('g.node')
          .data(nodes, function(d) {return d.id || (d.id = ++i); });

             // Enter any new modes at the parent's previous position.
  const nodeEnter = node.enter()
                        .append('g')
                        .attr('class', 'node')
                        .attr("transform", (d) => {
                          return "translate(" + source.x0 + "," + source.y0 + ")";
                        })
                        .on('click', click);

    // Add Circle for the nodes
  nodeEnter.append('circle')
           .attr('class', 'node')
           .attr('r', 1e-6)
           .style("fill", (d) => {
             return d._children ? "lightsteelblue" : "#fff";
           })  // TOOLTIP ON MOUSE OVER
           .on("mouseover", (d) => {
             // console.log(d);
             div.transition()
                .duration(200)
                .style("opacity", .9);
             div.html("some data info")
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
           })
           .on("mouseout", (d) => {
             div.transition()
                .duration(500)
                .style("opacity", 0);
           });

  // Add labels for the nodes
  nodeEnter.append('text')
           .attr("dy", ".35em")
           .attr("x", (d) => {
             return d.children || d._children ? -13 : 13;
           })
           .attr("text-anchor", (d) => {
             return d.children || d._children ? "end" : "start";
           })
           .text( (d) => { return d.data.name; });

    // UPDATE
  const nodeUpdate = nodeEnter.merge(node);
  // Transition to the proper position for the node
  nodeUpdate.transition()
            .duration(duration)
            .attr("transform", (d) => {
              return "translate(" + d.x + "," + d.y + ")";
            });

    // Update the node attributes and style
  nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');


    // Remove any exiting nodes
  const nodeExit = node.exit()
                       .transition()
                       .duration(duration)
                       .attr("transform", function(d) {
                         return "translate(" + source.x + "," + source.y + ")";
                       })
                       .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
          .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
          .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

   // Update the links...
   const link = g.selectAll('path.link')
                 .data(links, (d) => { return d.id; });

   // Enter any new links at the parent's previous position.
   const linkEnter = link.enter()
                         .insert('path', "g")
                         .attr("class", "link")
                         .attr('d', (d) => {
                           var o = {y: source.y0, x: source.x0}
                           return diagonal(o, o);
                         });

   // UPDATE
   const linkUpdate = linkEnter.merge(link);

   // Transition back to the parent element position
   linkUpdate.transition()
             .duration(duration)
             .attr('d', (d) => { return diagonal(d, d.parent) });

   // Remove any exiting links
   const linkExit = link.exit()
                        .transition()
                        .duration(duration)
                        .attr('d', (d) => {
                          var o = {x: source.x, y: source.y}
                          return diagonal(o, o)
                        })
                        .remove();

   // Store the old positions for transition.
  nodes.forEach( (d, i) => {
    d.x0 = d.x;
    d.y0 = d.y;
  });

}

// Takes an index and an array and finds all the children.
// returns an array which can be added to children of the root node to
// make a json thing which can be used to make a d3.hierarchy();
function getChildren(i, arr) {
  const childs = [];
  if (arr[i+1+i]){
    childs[0] = {name: arr[i*2+1], children: []};
    if( arr[i+i+2] ){
      childs[1] = {name: arr[i * 2 + 2], children:[]}  ;
    }
  }
  const nextin = i * 2 + 1;
  if (arr[nextin*2+1]) {
    childs[0].children = getChildren(nextin, arr)
    childs[0]._children = null;
    if (arr[nextin*2+2]) {
      childs[1].children = getChildren(nextin+1, arr);
      childs[1]._children = null;
    }
  }
  return childs;
}





// Creates a curved (diagonal) path from parent to the child nodes
// switched around all the x's and y's from orig so it's verticle
function diagonal(s, d) {
  path = `M ${s.x} ${s.y}
          C ${(s.x + d.x) / 2} ${s.y},
          ${(s.x + d.x) / 2} ${d.y},
          ${d.x} ${d.y}`
  return path;
}


// Toggle children on click.
function click(d) {
  // console.log(d);
// use the following to superficially change the text of the node.
//  this.getElementsByTagName('text')[0].textContent = "clicked all over"
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

// will make all the children null and store the real vals in _children
function collapse(d) {
  if (d.children) {
    d._children = d.children
    d.children = null;
    d._children.forEach(collapse)
  }
}
