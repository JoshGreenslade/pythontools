const aspect_ratio = 8.0/3.0
const height= 300
const width= height * aspect_ratio
const margin = 30
const markerColor = "hsl(0, 50%, 50%)"
const markerSize = 10
const backgroundColour = "hsl(0, 00%, 100%)"

document.body.style.backgroundColor = backgroundColour


const data = [
  [0, 0],
  [1, 1],
  [2, 4],
  [3, 9],
  [4, 16],
  [5, 25]
]


const data2 = [
  [0, 25],
  [1, 16],
  [2, 9],
  [3, 8],
  [4, 2],
  [5, 0]
]



var svg = d3.select(".area")
  .append("svg")
  .attr("width", width + 2*margin)
  .attr("height", height + 2*margin)
  .attr("viewBox", [0, 0, width + 2*margin, height + 2*margin])
  .append("g")
    .attr("transform", `translate(${margin}, ${margin})`)


var gridLayer = svg.append('g')
var lineLayer = svg.append('g')
var negativeLayer = svg.append('g')
var markerLayer = svg.append('g')

var x = d3.scaleLinear()
  .domain([0, 5])
  .range([0, width])

var y = d3.scaleLinear()
  .domain([0, 25])
  .range([height, 0])

var d3xAxis = d3.axisTop(x)
  .tickValues([])
  .tickSize(0);

var d3yAxis = d3.axisLeft(y)
  .tickValues([])
  .tickSize(0);

const xAxis = gridLayer.append('g')
  .attr("transform", `translate(0, ${height})`)
  .call(d3xAxis)

const yAxis = gridLayer.append('g')
  .call(d3yAxis);

xAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
yAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")

xAxis.transition()
  .attr('opacity', 1)
  .duration(1000)

yAxis.transition()
  .attr('opacity', 1)
  .duration(1000)

const line = d3.line()
  .x(d => x(d[0]))
  .y(d => y(d[1]))


function setMarkerAttributes(
  markers,
  color = markerColor,
  size = markerSize
  ) {
  markers
    .attr("cx", d => x(d[0]))
    .attr("cy", d => y(d[1]))
    .attr("r", size)
    .attr("fill", color)
    // .attr("stroke", backgroundColour)
    // .attr("stroke-width", markerSize/2)
}

const path = lineLayer.append('path')
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", markerColor)
  .attr("stroke-width", 3)
  .attr("d", line)
  .transition()
  .attr('opacity', 1)
  .duration(1000)

const path2 = lineLayer.append('path')
  .datum(data2)
  .attr("fill", "none")
  .attr("stroke", "hsl(225, 50%, 50%)")
  .attr("stroke-width", 1)
  .attr("d", line)
  .transition()
  .attr('opacity', 1)
  .duration(1000)

let negativeMarkers = negativeLayer.selectAll("markers")
  .data(data.concat(data2))
  .enter()
  .append("circle")
setMarkerAttributes(
  negativeMarkers,
  backgroundColour,
  markerSize*1.5
  )

let markers = markerLayer.selectAll("markers")
  .data(data)
  .enter()
  .append("circle")
setMarkerAttributes(
  markers,
  markerColor
  )

let markers2 = markerLayer.selectAll("markers2")
    .data(data2)
    .enter()
    .append("circle")
setMarkerAttributes(
  markers2,
  "hsl(225, 50%, 50%)",
  5
  )