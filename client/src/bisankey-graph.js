const hasSeen = {};
let timer;
socket.on('funcInfo', data => {
  const needToRefresh = parseData(data);
  const chartDomElementId = "#chart";
  if (needToRefresh) {
     clearTimeout(timer);
     scaleDuration();
     const nodeDataArray = nodeData(flatData);
     const linkDataArray = linkData(flatData);
     biHiSankey.nodeWidth(110)
               .nodeSpacing(10)
               .linkSpacing(5)
               .linkThicknessFactor(10)
               .size([2200, 1100])
               .onlyOneTextColor(false)
               .labelsAlwaysMiddle(true)
               .nodes(nodeDataArray)
               .links(linkDataArray)
               .initializeNodes(function (node) {
                 // collapsed means showing that node, contained means hiding the node
                 node.state = node.parent ? "contained" : "collapsed";
               })
               .layout(LAYOUT_INTERATIONS);
    disableUserInteractions(2 * TRANSITION_DURATION);
    update();
    highlightNewEvent();
  }
});

function nodeData(flatData) {
 const nodeDataArray = [];
 flatData.forEach((funcInfoNode) => {
   const nodeObj = {
     type: funcInfoNode.type,
     id: funcInfoNode.asyncId,
     trigger: funcInfoNode.triggerAsyncId,
     parent: null,
     startTime: funcInfoNode.startTime,
     duration: funcInfoNode.duration,
     durationScaled: funcInfoNode.durationScaled,
     errMessage: funcInfoNode.errMessage,
     resourceInfo: funcInfoNode.resourceInfo,
     name: funcInfoNode.type
   };
   if (nodeObj.startTime) nodeObj.startTime = nodeObj.startTime.toFixed(2);
   if (nodeObj.duration) nodeObj.duration = nodeObj.duration.toFixed(2);
   if(!hasSeen[`${funcInfoNode.type}${funcInfoNode.asyncId}`]) {
      nodeObj.isNew = true;
      hasSeen[`${funcInfoNode.type}${funcInfoNode.asyncId}`] = true;
   } else {
      nodeObj.isNew = false;
   }
   nodeDataArray.push(nodeObj);
 });
 return nodeDataArray;
}

function linkData(flatData) {
  const linkDataArray = [];
  flatData.forEach((funcInfoNode) => {
   const linkObj = {
     source: funcInfoNode.triggerAsyncId,
     target: funcInfoNode.asyncId,
     value: funcInfoNode.durationScaled
  };
  if(linkObj.source !== "Node.js core" && linkObj.source) {
    linkDataArray.push(linkObj);
  }
 });
 return linkDataArray;
}

function highlightNewEvent() {
  const funcData = d3.select("#nodes")
                     .selectAll(".node")

  funcData.filter( (d) => { return d.isNew === true; })
          .select("rect")
          .call(pulse, 750)

  funcData.filter( (d) => { return !d.isNew; })
          .select("rect")
          .style("stroke-opacity", 1)
  setTimeout(()=>{
    clearTimeout(timer);
  }, 10000)
}

function pulse(path, duration, end){
  path.transition()
      .duration(duration)
      .style('stroke-opacity', .2)
      .transition()
      .style('stroke-opacity', 1)
  timer = setTimeout(function() { pulse(path, duration); }, duration*2);
}

// https://github.com/northam/styled_sankey/blob/master/bihisankey.app.js
let svg, tooltip, biHiSankey, path, defs, colorScale, highlightColorScale, isTransitioning;

let OPACITY = {
      NODE_DEFAULT: 0.9,
      NODE_FADED: 0.1,
      NODE_HIGHLIGHT: 1,
      LINK_DEFAULT: 0.6,
      LINK_FADED: 0.05,
      LINK_HIGHLIGHT: 0.9
    },
  TYPES = ["Solution", "Financial_Product", "Function", "Module", "Component", "Interface"],
  TYPE_COLORS = ["#5CE5BB", "#BFEF62", "#F4D038", "#F49751", "#F26BBC", "#3E8BF9"],
  TYPE_HIGHLIGHT_COLORS = ["#8EF4D6", "#D9FF97", "#F9E178", "#F7B279", "#F99DD0", "#6BA2F9"],
  LINK_COLOR = "#ede2bb",
  INFLOW_COLOR = "#ffd644",
  OUTFLOW_COLOR = "#6cfff9",
  NODE_WIDTH = 20,
  COLLAPSER = {
    RADIUS: 14,
    SPACING: 3
  },
  OUTER_MARGIN = 10,
  MARGIN = {
    TOP: 2 * COLLAPSER.RADIUS + OUTER_MARGIN,
    RIGHT: OUTER_MARGIN,
    BOTTOM: OUTER_MARGIN,
    LEFT: OUTER_MARGIN
  },
  TRANSITION_DURATION = 200,
  WIDTH = 2300 - MARGIN.LEFT - MARGIN.RIGHT,
  HEIGHT = 1100 - MARGIN.TOP - MARGIN.BOTTOM,
  LAYOUT_INTERATIONS = 10;

// Used when temporarily disabling user interactions to allow animations to complete
function disableUserInteractions(time) {
  isTransitioning = true;
  setTimeout(function() {
    isTransitioning = false;
  }, time);
}

function hideTooltip() {
  return tooltip.transition()
                .duration(TRANSITION_DURATION)
                .style("opacity", 0);
}

function showTooltip() {
  return tooltip.style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + 15 + "px")
                .transition()
                .duration(TRANSITION_DURATION)
                .style("opacity", 1);
}


colorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_COLORS),
highlightColorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_HIGHLIGHT_COLORS),

svg = d3.select('#bisankey-container')
        .append("svg")
        .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
        .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
        .style("padding", "0px 0px 70px 0px")
        .append("g")
        .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

svg.append("g").attr("id", "links");
svg.append("g").attr("id", "nodes");
svg.append("g").attr("id", "collapsers");

tooltip = d3.select('#bisankey-container').append("div").attr("id", "tooltip");

tooltip.style("opacity", 0)
       .append("p")
       .attr("class", "value");


biHiSankey = d3.biHiSankey();

biHiSankey.nodeWidth(NODE_WIDTH)
          .nodeSpacing(10)
          .linkSpacing(4)
          .arrowheadScaleFactor(0.5)
          .size([WIDTH, HEIGHT])
          .onlyOneTextColor(false)
          .labelsAlwaysMiddle(true);

path = biHiSankey.link().curvature(0.45);

  defs = svg.append("defs");

  defs.append("marker")
      .style("fill", LINK_COLOR)
      .attr("id", "arrowHead")
      .attr("viewBox", "0 0 6 10")
      .attr("refX", "1")
      .attr("refY", "5")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "1")
      .attr("markerHeight", "1")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 1 0 L 6 5 L 1 10 L 0 10 z");

  defs.append("marker")
      .style("fill", OUTFLOW_COLOR)
      .attr("id", "arrowHeadInflow")
      .attr("viewBox", "0 0 6 10")
      .attr("refX", "1")
      .attr("refY", "5")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "1")
      .attr("markerHeight", "1")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 1 0 L 6 5 L 1 10 L 0 10 z");

  defs.append("marker")
      .style("fill", INFLOW_COLOR)
      .attr("id", "arrowHeadOutlow")
      .attr("viewBox", "0 0 6 10")
      .attr("refX", "1")
      .attr("refY", "5")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "1")
      .attr("markerHeight", "1")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 1 0 L 6 5 L 1 10 L 0 10 z");


function update () {
  let link, linkEnter, node, nodeEnter, collapser, collapserEnter;

  function containChildren(node) {
    node.state = "contained";
    const trigger = node.trigger;
    node.connectedNodes.forEach(function(child) {
      if (trigger !== child.id) {
        containChildren(child)
      }
    });
  }

  function expand(node) {
    node.state = "expanded";
    const trigger = node.trigger;
    node.connectedNodes.forEach(function(child) {
      if (trigger !== child.id) {
        containChildren(child);   //hide all children
      }
    });
  }

  function collapse(node) {
    node.state = "collapsed";
    const trigger = node.trigger;
    node.connectedNodes.forEach(function(child) {
      if (trigger !== child.id) {
        collapse(child)
      }
    });
  }

  function restoreLinksAndNodes() {
    link.style("stroke", LINK_COLOR)
        .style("marker-end", function () { return 'url(#arrowHead)'; })
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", OPACITY.LINK_DEFAULT);

    node.selectAll("rect")
        .style("fill", function (d) { return colorScale(d.type.replace(/ .*/, "")); })
        .style("stroke", function (d) { return d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1); })
        .style("fill-opacity", OPACITY.NODE_DEFAULT);

    node.filter(function (n) { return n.state === "collapsed"; })
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", OPACITY.NODE_DEFAULT);
  }

  function showHideChildren(node) {
    disableUserInteractions(2 * TRANSITION_DURATION);
    if (node.state === "collapsed") expand(node);  //to collaspe nodes, change state to expanded
    else collapse(node); //to collapse nodes, change state to collapsed

    biHiSankey.relayout();
    restoreLinksAndNodes();
    update();
    link.attr("d", path);
  }

  function highlightConnected(g) {
    link.filter(function (d) { return d.source === g; })
        .style("marker-end", function () { return 'url(#arrowHeadInflow)'; })
        .style("stroke", OUTFLOW_COLOR)
        .style("opacity", OPACITY.LINK_DEFAULT);

    link.filter(function (d) { return d.target === g; })
        .style("marker-end", function () { return 'url(#arrowHeadOutlow)'; })
        .style("stroke", INFLOW_COLOR)
        .style("opacity", OPACITY.LINK_DEFAULT);
  }

  function fadeUnconnected(g) {
    link.filter(function (d) { return d.source !== g && d.target !== g; })
        .style("marker-end", function () { return 'url(#arrowHead)'; })
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", OPACITY.LINK_FADED);

    node.filter(function (d) { return (d.name === g.name) ? false : !biHiSankey.connected(d, g); })
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", OPACITY.NODE_FADED);
  }

  function displayInfoPanel(g) {
    d3.select("#chart-info").selectAll("*").remove();
    if (!isTransitioning) {
      restoreLinksAndNodes();
      highlightConnected(g);
      fadeUnconnected(g);
      d3.select(this).select("rect")
        .style("fill", function (d) {
          d.color = d.netFlow > 0 ? INFLOW_COLOR : OUTFLOW_COLOR;
          return d.color;
        })
      .style("stroke", function (d) { return d3.rgb(d.color).darker(0.1); })
      .style("fill-opacity", OPACITY.LINK_DEFAULT);

      let parentPanel = d3.select("#chart-info")
                          .selectAll("#chartData")
                          .data([g, ...g.rightLinks])
                          .enter()
                          .append("foreignObject")
                          .append("xhtml:div")
                          .attr("class", "chart-info")
                          .style("background-color", function(d) {
                            return d.color ? d.color : d.target.color;
                          })

      parentPanel.append("h4").attr("class", "func-name")
                 .text((d) => { return `${d.type ? d.type : d.target.type}`})

      parentPanel.append("p").attr("class", "func-data")
                 .text(d => { return `Id: ${d.id ? d.id : d.target.id}`})

      parentPanel.append("p").attr("class", "func-data")
                 .text((d) => {
                   return d.target ?
                     `Start time: ${d.startTime ? d.startTime : d.target.startTime} `
                    :
                     `Start time: ${d.startTime ? d.startTime : 'unfinished'} `;
                 })

      parentPanel.append("p").attr("class", "func-data")
                 .text((d) => {
                   return d.target ?
                     `Runtime: ${d.duration ? d.duration : d.target.duration} ms`
                    :
                     `Runtime: ${d.duration ? d.duration : 'unfinished'} ms`;
                 })

      parentPanel.append("p").attr("class", "stack-expand")
                 .attr("id", (d) => `err${d.id ? d.id : d.target.id}`)
                 .text( () => { return `Click to show stack trace`})

      function breakLines(str) {
        let chunks = 25; // enter space every 25 chars
        let res = '';
        for(let i=0; i<str.length; i++) {
          res += str[i];
          if(i !== 0 && i % chunks === 0) {
            res += ' ';
          }
        }
        return res;
      }

      let errors = d3.selectAll(".stack-expand")
      errors.on("click", (d) => {
        let errId = `#${d3.event.target.id}`
        if(!d.errorShown){
          d.errorShown = true;
          d3.select(errId)
            .append("foreignObject")
            .append("xhtml:div")
            .attr('width', 300)
            .attr("class", "stack-data")
            .text((d) => { return `${d.errMessage ? d.errMessage : d.target.errMessage}`})
        } else {
          d3.select(errId).select('.stack-data').remove()
          d.errorShown = false;
        }
      });
    }
  }

  link = svg.select("#links")
            .selectAll("path.link")
            .data(biHiSankey.visibleLinks(), function(d) { return d.id; });

  link.transition()
      .duration(TRANSITION_DURATION)
      .attr("stroke-width", function (d) {return Math.max(1, d.thickness); })
      .attr("d", path)
      .style("opacity", OPACITY.LINK_DEFAULT);

  link.exit().remove();

  linkEnter = link.enter().append("path")
                  .attr("class", "link")
                  .style("fill", "none");

  linkEnter.on('mouseenter', function (d) {
    if (!isTransitioning) {
      showTooltip().select(".value").text(function() {
        if (d.direction > 0) {
          return d.source.name + " -> " + d.target.name;
        }
        return d.target.name + " <- " + d.source.name;
      });
      d3.select(this)
        .style("stroke", LINK_COLOR)
        .transition()
        .duration(TRANSITION_DURATION / 2)
        .style("opacity", OPACITY.LINK_HIGHLIGHT);
    }
  });

  linkEnter.on('mouseleave', function () {
    if (!isTransitioning) {
      hideTooltip();
      d3.select(this)
        .style("stroke", LINK_COLOR)
        .transition()
        .duration(TRANSITION_DURATION / 2)
        .style("opacity", OPACITY.LINK_DEFAULT);
    }
  });

  linkEnter.sort(function (a, b) { return b.thickness - a.thickness; })
           .classed("leftToRight", function(d) {return d.direction > 0;})
           .classed("rightToLeft", function(d) {return d.direction < 0;})
           .style("marker-end", function() {return 'url(#arrowHead)';})
           .style("stroke", LINK_COLOR)
           .style("opacity", 0)
           .transition()
           .delay(TRANSITION_DURATION)
           .duration(TRANSITION_DURATION)
           .attr("d", path)
           .attr("stroke-width", function (d) {return Math.max(1, d.thickness);})
           .style("opacity", OPACITY.LINK_DEFAULT);

  node = svg.select("#nodes").selectAll(".node")
            .data(biHiSankey.collapsedNodes(), function(d) { return d.id; });

  node.transition()
      .duration(TRANSITION_DURATION)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("opacity", OPACITY.NODE_DEFAULT)
      .select("rect")
      .style("fill", function(d) {
        d.color = colorScale(d.type.replace(/ .*/, ""));
        return d.color;
      })
      .style("stroke", function(d) { return d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1); })
      .attr("stroke-width", "1px")
      .attr("height", function(d) { return d.height; })
      .attr("width", biHiSankey.nodeWidth());

  node.exit()
      .transition()
      .duration(TRANSITION_DURATION)
      .attr("transform", function (d) {
        let collapsedAncestor, endX, endY;
        collapsedAncestor = d.ancestors.filter(function (a) {
          return a.state === "collapsed";
        })[0];
        endX = collapsedAncestor ? collapsedAncestor.x : d.x;
        endY = collapsedAncestor ? collapsedAncestor.y : d.y;
        return "translate(" + endX + "," + endY + ")";
      })
      .remove();


  nodeEnter = node.enter().append("g").attr("class", "node");

  nodeEnter.attr("transform", function (d) {
              const startX = d._parent ? d._parent.x : d.x;
              const startY = d._parent ? d._parent.y : d.y;
              return "translate(" + startX + "," + startY + ")";
            })
           .style("opacity", 1e-6)
           .transition()
           .duration(TRANSITION_DURATION)
           .style("opacity", OPACITY.NODE_DEFAULT)
           .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  nodeEnter.append("rect")
           .style("fill", function(d) {
             d.color = colorScale(d.type.replace(/ .*/, ""));
             return d.color;
           })
           .style("stroke", function(d) {return d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1);})
           .style("stroke-width", "1px")
           .attr("height", function(d) { return d.height; })
           .attr("width", biHiSankey.nodeWidth());

  nodeEnter.append("foreignObject")   // can be deleted?
           .append("xhtml:text")
           .attr("class", "node-type")
           .text(function(d) {
              if(d.sourceLinks.length > 0 || d.leftLinks.length > 0) {
                return d.name
              }
            });




  node.on("mouseenter", displayInfoPanel);

  node.on("mouseleave", function() { if (!isTransitioning) restoreLinksAndNodes(); });

  node.on("click", showHideChildren);

  nodeEnter.on("mouseenter", displayInfoPanel);

  nodeEnter.on("mouseleave", function() { if (!isTransitioning) restoreLinksAndNodes(); });

  nodeEnter.on("click", showHideChildren)

  // add in the text for the nodes
  node.filter(function (d) { return d.value !== 0; })
      .select("text")
      .attr("x", biHiSankey.labelsAlwaysMiddle() ? biHiSankey.nodeWidth()/2 : -6)
      .attr("y", function (d) { return d.height / 2 - ((d.name.length-1)*7); })
      .attr("dy", ".35em")
      .attr("text-anchor", biHiSankey.labelsAlwaysMiddle() ? "middle" : "end")
      .text(function (d) { return d.name; });

  if (!biHiSankey.onlyOneTextColor())
    node.filter(function (d) { return d.value !== 0; })
        .select("text")
        .style("fill", function (d) { return colorScale(d.type.replace(/ .*/, "")); });

  if (!biHiSankey.labelsAlwaysMiddle())
    node.filter(function (d) { return d.value !== 0; })
        .select("text")
        .filter(function (d) { return d.x < biHiSankey.nodeWidth() / 2; })
        .attr("x", 6 + biHiSankey.nodeWidth())
        .attr("text-anchor", "start");

  collapser = svg.select("#collapsers").selectAll(".collapser")
                 .data(biHiSankey.expandedNodes(), function (d) { return d.id; });

  collapserEnter = collapser.enter().append("g").attr("class", "collapser");

  collapserEnter.append("circle")
                .attr("r", COLLAPSER.RADIUS)
                .style("fill", function (d) {
                  d.color = colorScale(d.type.replace(/ .*/, ""));
                  return d.color;
                });

  collapserEnter.style("opacity", OPACITY.NODE_DEFAULT)
                .attr("transform", function(d) {
                  return "translate(" + (d.x + d.width / 2) + "," + (d.y + COLLAPSER.RADIUS) + ")";
                });

  collapserEnter.on("click", showHideChildren );

  collapser.select("circle")
           .attr("r", COLLAPSER.RADIUS);

  collapser.transition()
           .delay(TRANSITION_DURATION)
           .duration(TRANSITION_DURATION)

  collapser.on("mouseenter", function (g) {
    if (!isTransitioning) {
      let highlightColor = highlightColorScale(g.type.replace(/ .*/, ""));

      d3.select(this)
        .style("opacity", OPACITY.NODE_HIGHLIGHT)
        .select("circle")
        .style("fill", highlightColor);

      node.filter(function (d) {return d.ancestors.indexOf(g) >= 0;})
          .style("opacity", OPACITY.NODE_HIGHLIGHT)
          .select("rect")
          .style("fill", highlightColor);
    }
  });

  collapser.on("mouseleave", function (g) {
    if (!isTransitioning) {
      d3.select(this)
        .style("opacity", OPACITY.NODE_DEFAULT)
        .select("circle")
        .style("fill", function (d) { return d.color; });

      node.filter(function(d) {return d.ancestors.indexOf(g) >= 0;})
          .style("opacity", OPACITY.NODE_DEFAULT)
          .select("rect")
          .style("fill", function (d) { return d.color; });
    }
  });
  collapser.exit().remove();
}
