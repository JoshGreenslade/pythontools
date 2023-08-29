const aspect_ratio = 8.0/3.0
const height= 250
const width= height * aspect_ratio
const margin = 30

var svg = d3.select(".area")
  .append("svg")
  .attr("width", width + 2*margin)
  .attr("height", height + 2*margin)
  .append("g")
    .attr("transform", `translate(${margin}, ${margin})`)

var x = d3.scaleLinear()
  .domain([0, width])
  .range([0, width])

var y = d3.scaleLinear()
  .domain([0, height])
  .range([0, height])

var d3xAxis = d3.axisTop(x)
  .tickValues([])
  .tickSize(0);


var d3yAxis = d3.axisLeft(y)
  .tickValues([])
  .tickSize(0);

const xAxis = svg.append('g')
  .attr("transform", `translate(0, ${height})`)
  .call(d3xAxis)

const yAxis = svg.append('g')
  .call(d3yAxis);

xAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
yAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")

xAxis.transition()
  .attr('opacity', 1)
  .duration(1000)

yAxis.transition()
  .attr('opacity', 1)
  .duration(1000)


console.log('hello')