var arr = ["SANKEY!!!","string2","string3","string4","string5"];
      
  d3.select('#sankey_info')
    .selectAll('div')
    .data(arr)
    .enter()
    .append('div')
    .text(function(d){
      return d;
    });
        
