const aspect_ratio = 8.0/3.0
const height= 300
const width= height * aspect_ratio

var svg = d3.select(".area")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background-color","red")

var x = d3.scaleLinear()
  .domain([0, width])
  .range([0, width])

var y = d3.scaleLinear()
  .domain([0, height])
  .range([0, height])

svg.append('g')
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisTop(x));
svg.append('g').call(d3.axisRight(y));

console.log('hello')