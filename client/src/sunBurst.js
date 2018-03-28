const sunSocket = io.connect('http://localhost:3000');
sunSocket.on('packageInfo', data => {
  let rootTime = 0;
	let sunData = data;
  for(let i = 0; i < sunData.children.length; i++){
    rootTime += sunData.children[i].totalTime
  }
    root = d3.hierarchy(sunData);
    root.sum(function(d) { return d.duration; });
    svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
        .on("click", click)
        .append("title")
        .text(function(d) { return d.data.name + "\n" + formatNumber(d.data.totalTime); });

  var packageData = d3.select("#package-panel")
      .selectAll("#packageData")
      .data(sunData.children)
      .enter()
      .append("div")
      .attr("class", "package-info")
   
    packageData.append("h4").attr("class", "package-name")
               .text((d) => { return `${d.name}`})
    packageData.append("p").attr("class", "package-data")
               .text((d) => { return `percentage: ${Math.floor(d.totalTime/rootTime * 100)}%`})
    packageData.append("p").attr("class", "package-data")
               .text((d) => { return `time taken to load: ${d.totalTime}`})

})

var sunWidth = 960,
    sunHeight = 700,
    radius = (Math.min(sunWidth, sunHeight) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


var svg = d3.select("#sunburst-container").append("svg")
    .attr("id", "sun-container")
    .attr("width", sunWidth)
    .attr("height", sunHeight)
    .append("g")
    .attr("transform", "translate(" + sunWidth / 2 + "," + (sunHeight / 2) + ")");

function click(d) {
  svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

d3.select(self.frameElement).style("height", sunHeight + "px");

