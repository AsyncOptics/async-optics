const MIN_DURATION = 20;
let lastLength;
const hasSeen = {};
let newEventArray;
socket.on('funcInfo', data => {
  // console.log('raw Data', data.length);
  const needToRefresh = parseData(data);
  const chartDomElementId = "#chart";
  if (needToRefresh) {
     const nodeDataArray = nodeData(flatData);
     const linkDataArray = linkData(flatData);
     // console.log('flat Data', flatData);
     // console.log('nodeDataArray', nodeDataArray)
     // console.log('linkDataArray', linkDataArray)
     // console.log('lastLen, newLength', lastLength, newLength)
     // console.log('non-sliced', linkDataArray)
     // console.log('sliced', linkDataArray.slice(newLength - 1, -1))
     biHiSankey.nodeWidth(40)
               .size([1000, 950])
               .onlyOneTextColor(false)
               .labelsAlwaysMiddle(true)
               .nodes(nodeDataArray)
               .links(linkDataArray)
               .initializeNodes(function (node) {
                 node.state = node.parent ? "contained" : "collapsed";
               })
               .layout(LAYOUT_INTERATIONS);
               disableUserInteractions(2 * TRANSITION_DURATION);
               update();

    d3.select("#func-panel").selectAll("*").remove()
    var packageData = d3.select("#func-panel")
                        .selectAll("#funcData")
                        .data(newEventArray)
                        .enter()
                        .append("div")
                        .attr("class", "func-info")
                        .style("border-color", function(d){
                          return d.target.color;
                        })
    packageData.append("h4").attr("class", "func-name")
               .text((d) => { return `${d.target.type} - ${d.target.id}` })
    packageData.append("p").attr("class", "func-data")
               .text((d) => { return `triggered by ${d.source.type} - ${d.source.id}` })
    packageData.append("p").attr("class", "package-data")
               .text((d) => { return `time taken to run: ${d.target.duration} ms`})
    packageData.append("p").attr("class", "package-data")
               .text((d) => { return `${d.target.errMessage}`})
    }
});


function nodeData(flatData) {
 const nodeDataArray = [];
 flatData.forEach((funcInfoNode) => {
   const nodeObj = {
     type: funcInfoNode.type,
     id: funcInfoNode.asyncId,
     parent: null,
     startTime: funcInfoNode.startTime,
     duration: funcInfoNode.duration,
     errMessage: funcInfoNode.errMessage,
     resourceInfo: funcInfoNode.resourceInfo,
     name: funcInfoNode.type
   };
   if (!nodeObj.duration) nodeObj.duration = MIN_DURATION;
   nodeDataArray.push(nodeObj);
 });
 return nodeDataArray;
}

function linkData(flatData) {
  const linkDataArray = [];
  newEventArray = [];
  flatData.forEach((funcInfoNode) => {
   const linkObj = {
     source: funcInfoNode.triggerAsyncId,
     target: funcInfoNode.asyncId,
     value: funcInfoNode.duration
  };

  if(linkObj.source !== "Node.js core" && linkObj.source) {
    if (!linkObj.value) linkObj.value = MIN_DURATION;
    console.log(newEventArray)
    if(!hasSeen[`${funcInfoNode.type}${funcInfoNode.asyncId}`]){
      newEventArray.push(linkObj)
      hasSeen[`${funcInfoNode.type}${funcInfoNode.asyncId}`] = true;
      // console.log('after', hasSeen)
    }
    linkDataArray.push(linkObj);
  }
 });

 return linkDataArray;
}


// https://github.com/northam/styled_sankey/blob/master/bihisankey.app.js

let svg, tooltip, biHiSankey, path, defs, colorScale, highlightColorScale, isTransitioning;

var OPACITY = {
    NODE_DEFAULT: 0.9,
    NODE_FADED: 0.1,
    NODE_HIGHLIGHT: 1,
    LINK_DEFAULT: 0.6,
    LINK_FADED: 0.05,
    LINK_HIGHLIGHT: 0.9
  },
  TYPES = ["Solution", "Financial_Product", "Function", "Module", "Component", "Interface"],
  TYPE_COLORS = ["#ffd644", "#6cfff9", "#30ff2c", "#ee74ff", "#ccff43", "#ff7d63"],
  TYPE_HIGHLIGHT_COLORS = ["#ffd644", "#6cfff9", "#30ff2c", "#ee74ff", "#ccff43", "#ff7d63"],
  LINK_COLOR = "#ede2bb",
  INFLOW_COLOR = "#ffd644",
  OUTFLOW_COLOR = "#6cfff9",
  NODE_WIDTH = 20,
  COLLAPSER = {
    RADIUS: NODE_WIDTH,
    SPACING: 2
  },
  OUTER_MARGIN = 10,
  MARGIN = {
    TOP: 2 * COLLAPSER.RADIUS + OUTER_MARGIN,
    RIGHT: OUTER_MARGIN,
    BOTTOM: OUTER_MARGIN,
    LEFT: OUTER_MARGIN
  },
  TRANSITION_DURATION = 400,
  WIDTH = 1300 - MARGIN.LEFT - MARGIN.RIGHT,
  HEIGHT = 1000 - MARGIN.TOP - MARGIN.BOTTOM,
  LAYOUT_INTERATIONS = 32,
  REFRESH_INTERVAL = 7000;

var formatNumber = function (d) {
  var numberFormat = d3.format(",.0f"); // zero decimal places
  return "$" + numberFormat(d);
},

formatFlow = function (d) {
  var flowFormat = d3.format(",.0f"); // zero decimal places with sign
  return "$" + flowFormat(Math.abs(d)) + (d < 0 ? " CR" : " DR");
},

// Used when temporarily disabling user interactions to allow animations to complete
disableUserInteractions = function (time) {
  isTransitioning = true;
  setTimeout(function(){
    isTransitioning = false;
  }, time);
},

hideTooltip = function () {
  return tooltip.transition()
    .duration(TRANSITION_DURATION)
    .style("opacity", 0);
},

showTooltip = function () {
  return tooltip
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY + 15 + "px")
    .transition()
      .duration(TRANSITION_DURATION)
      .style("opacity", 1);
};

/** The parent DOM element id of D3 chart should be specified in html.
 * Let's check it for integrity.
 * Default value is "#chart".
 * */
if (typeof chartDomElementId  === 'undefined') var chartDomElementId = "#chart"; // will make it optional
if (!chartDomElementId) chartDomElementId = "#chart";

colorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_COLORS),
highlightColorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_HIGHLIGHT_COLORS),

svg = d3.select(chartDomElementId)
        .append("svg")
        .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
        .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
        .append("g")
        .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

svg.append("g").attr("id", "links");
svg.append("g").attr("id", "nodes");
svg.append("g").attr("id", "collapsers");

tooltip = d3.select(chartDomElementId).append("div").attr("id", "tooltip");

tooltip.style("opacity", 0)
    .append("p")
      .attr("class", "value");

/** New D3 diagram object */
biHiSankey = d3.biHiSankey();

/** biHiSankey default properties
 *  Set as many defaults as possible to avoid error for the missing property in further declarations in html file
 */
biHiSankey
  .nodeWidth(NODE_WIDTH)
  .nodeSpacing(10)
  .linkSpacing(4)
  .arrowheadScaleFactor(0.5) // Specifies that 0.5 of the link's stroke WIDTH should be allowed for the marker at the end of the link.
  .size([WIDTH, HEIGHT])
  .onlyOneTextColor(false)  // 'true' will render single only AND the same text color as specified in css
  .labelsAlwaysMiddle(false); // 'true' will align node's text in the middle. 'false' will align left and right

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
  var link, linkEnter, node, nodeEnter, collapser, collapserEnter;

  function dragmove(node) {
    node.x = Math.max(0, Math.min(WIDTH - node.width, d3.event.x));
    node.y = Math.max(0, Math.min(HEIGHT - node.height, d3.event.y));
    d3.select(this).attr("transform", "translate(" + node.x + "," + node.y + ")");
    biHiSankey.relayout();
    svg.selectAll(".node").selectAll("rect").attr("height", function (d) { return d.height; });
    link.attr("d", path);
  }

  function containChildren(node) {
    node.children.forEach(function (child) {
      child.state = "contained";
      child.parent = this;
      child._parent = null;
      containChildren(child);
    }, node);
  }

  function expand(node) {
    node.state = "expanded";
    node.children.forEach(function (child) {
      child.state = "collapsed";
      child._parent = this;
      child.parent = null;
      containChildren(child);
    }, node);
  }

  function collapse(node) {
    node.state = "collapsed";
    containChildren(node);
  }

  function restoreLinksAndNodes() {
    link
      .style("stroke", LINK_COLOR)
      .style("marker-end", function () { return 'url(#arrowHead)'; })
      .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", OPACITY.LINK_DEFAULT);

    node
      .selectAll("rect")
        .style("fill", function (d) {
          d.color = colorScale(d.type.replace(/ .*/, ""));
          return d.color;
        })
        .style("stroke", function (d) {
          return d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1);
        })
        .style("fill-opacity", OPACITY.NODE_DEFAULT);

    node.filter(function (n) { return n.state === "collapsed"; })
      .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", OPACITY.NODE_DEFAULT);
  }

  function showHideChildren(node) {
    console.log(node, 'clicked' )
    disableUserInteractions(2 * TRANSITION_DURATION);
    hideTooltip();
    if (node.state === "collapsed") { expand(node); }
    else { collapse(node); }

    biHiSankey.relayout();
    update();
    link.attr("d", path);
    restoreLinksAndNodes();
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

    node.filter(function (d) {
      return (d.name === g.name) ? false : !biHiSankey.connected(d, g);
    }).transition()
      .duration(TRANSITION_DURATION)
      .style("opacity", OPACITY.NODE_FADED);
  }

  link = svg.select("#links").selectAll("path.link")
    .data(biHiSankey.visibleLinks(), function (d) { return d.id; });

  link.transition()
    .duration(TRANSITION_DURATION)
    .style("stroke-WIDTH", function (d) { return Math.max(1, d.thickness); })
    .attr("d", path)
    .style("opacity", OPACITY.LINK_DEFAULT);


  link.exit().remove();


  linkEnter = link.enter().append("path")
    .attr("class", "link")
    .style("fill", "none");

  linkEnter.on('mouseenter', function (d) {
    if (!isTransitioning) {
      showTooltip().select(".value").text(function () {
        if (d.direction > 0) {
          return d.source.name + " -> " + d.target.name; /* + "\n" + formatNumber(d.value);*/
        }
        return d.target.name + " <- " + d.source.name; /* + "\n" + formatNumber(d.value);*/
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
    .classed("leftToRight", function (d) {
      return d.direction > 0;
    })
    .classed("rightToLeft", function (d) {
      return d.direction < 0;
    })
    .style("marker-end", function () {
      return 'url(#arrowHead)';
    })
    .style("stroke", LINK_COLOR)
    .style("opacity", 0)
    .transition()
      .delay(TRANSITION_DURATION)
      .duration(TRANSITION_DURATION)
      .attr("d", path)
      .style("stroke-WIDTH", function (d) { return Math.max(1, d.thickness); })
      .style("opacity", OPACITY.LINK_DEFAULT);


  node = svg.select("#nodes").selectAll(".node")
      .data(biHiSankey.collapsedNodes(), function (d) { return d.id; });


  node.transition()
    .duration(TRANSITION_DURATION)
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("opacity", OPACITY.NODE_DEFAULT)
    .select("rect")
      .style("fill", function (d) {
        d.color = colorScale(d.type.replace(/ .*/, ""));
        return d.color;
      })
      .style("stroke", function (d) { return d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1); })
      .style("stroke-WIDTH", "1px")
      .attr("height", function (d) { return d.height; })
      .attr("width", biHiSankey.nodeWidth());


  node.exit()
    .transition()
      .duration(TRANSITION_DURATION)
      .attr("transform", function (d) {
        var collapsedAncestor, endX, endY;
        collapsedAncestor = d.ancestors.filter(function (a) {
          return a.state === "collapsed";
        })[0];
        endX = collapsedAncestor ? collapsedAncestor.x : d.x;
        endY = collapsedAncestor ? collapsedAncestor.y : d.y;
        return "translate(" + endX + "," + endY + ")";
      })
      .remove();


  nodeEnter = node.enter().append("g").attr("class", "node");

  nodeEnter
    .attr("transform", function (d) {
      var startX = d._parent ? d._parent.x : d.x,
          startY = d._parent ? d._parent.y : d.y;
      return "translate(" + startX + "," + startY + ")";
    })
    .style("opacity", 1e-6)
    .transition()
      .duration(TRANSITION_DURATION)
      .style("opacity", OPACITY.NODE_DEFAULT)
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  nodeEnter.append("rect")
    .style("fill", function (d) {
      d.color = colorScale(d.type.replace(/ .*/, ""));
      return d.color;
    })
    .style("stroke", function (d) {
      return d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1);
    })
    .style("stroke-WIDTH", "1px")
    .attr("height", function (d) { return d.height; })
    .attr("width", biHiSankey.nodeWidth());
  nodeEnter.append("foreignObject")
           .append("xhtml:text")
           .attr("class", "node-type")
           .text(function(d) { 
              if(d.sourceLinks.length > 0 || d.leftLinks.length > 0){
                return d.name
              }
            });

  node.on("mouseenter", function (g) {
    if (!isTransitioning) {
      restoreLinksAndNodes();
      highlightConnected(g);
      fadeUnconnected(g);

      d3.select(this).select("rect")
        .style("fill", function (d) {
          d.color = d.netFlow > 0 ? INFLOW_COLOR : OUTFLOW_COLOR;
          return d.color;
        })
        .style("stroke", function (d) {
          return d3.rgb(d.color).darker(0.1);
        })
        .style("fill-opacity", OPACITY.LINK_DEFAULT);

      tooltip
        .style("left", g.x + MARGIN.LEFT + "px")
        .style("top", g.y + g.height + MARGIN.TOP + 15 + "px")
        .transition()
          .duration(TRANSITION_DURATION)
          .style("opacity", 1).select(".value")
          .text(function () {
            var additionalInstructions = g.children.length ? "\n(Double click to expand)" : "";
            /*return g.name + "\nNet flow: " + formatFlow(g.netFlow) + additionalInstructions;*/
            return g.name + g.errMessage;
          });
    }
  });

  node.on("mouseleave", function () {
    if (!isTransitioning) {
      hideTooltip();
      restoreLinksAndNodes();
    }
  });

  node.on("click", showHideChildren)

  // add in the text for the nodes
  node
  .filter(function (d) { return d.value !== 0; })
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

  collapserEnter
    .style("opacity", OPACITY.NODE_DEFAULT)
    .attr("transform", function (d) {
      return "translate(" + (d.x + d.width / 2) + "," + (d.y + COLLAPSER.RADIUS) + ")";
    });

  collapserEnter.on("click", showHideChildren );

  collapser.select("circle")
    .attr("r", COLLAPSER.RADIUS);

  collapser.transition()
    .delay(TRANSITION_DURATION)
    .duration(TRANSITION_DURATION)
    .attr("transform", function (d, i) {
      return "translate("
        + (COLLAPSER.RADIUS + i * 2 * (COLLAPSER.RADIUS + COLLAPSER.SPACING))
        + ","
        + (-COLLAPSER.RADIUS - OUTER_MARGIN)
        + ")";
    });

  collapser.on("mouseenter", function (g) {
    if (!isTransitioning) {
      showTooltip().select(".value")
        .text(function () {
          console.log(g)
          return g.name + "\n(Double click to collapse its children)";
        });

      var highlightColor = highlightColorScale(g.type.replace(/ .*/, ""));

      d3.select(this)
        .style("opacity", OPACITY.NODE_HIGHLIGHT)
        .select("circle")
          .style("fill", highlightColor);

      node.filter(function (d) {
        return d.ancestors.indexOf(g) >= 0;
      }).style("opacity", OPACITY.NODE_HIGHLIGHT)
        .select("rect")
          .style("fill", highlightColor);
    }
  });

  collapser.on("mouseleave", function (g) {
    if (!isTransitioning) {
      hideTooltip();
      d3.select(this)
        .style("opacity", OPACITY.NODE_DEFAULT)
        .select("circle")
          .style("fill", function (d) { return d.color; });

      node.filter(function (d) {
        return d.ancestors.indexOf(g) >= 0;
      }).style("opacity", OPACITY.NODE_DEFAULT)
        .select("rect")
          .style("fill", function (d) { return d.color; });
    }
  });

  collapser.exit().remove();

}
