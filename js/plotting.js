const aspect_ratio = 8.0/3.0
const height= 300
const width= height * aspect_ratio
const margin = 30
const markerColor = "hsl(0, 50%, 50%)"
const markerSize = 10
const backgroundColour = "hsl(0, 0%, 20%)"

document.body.style.backgroundColor = backgroundColour

function createGridLayer() {
  let classAttr = "grid-layer"

  let x = d3.scaleLinear()
    .domain([0, 5])
    .range([0, width])

  let y = d3.scaleLinear()
    .domain([0, 25])
    .range([height, 0])

  function layer(selection) {
    selection.each(function() {
      let g = d3.select(this)
        .append('g')
        .attr('class', classAttr)

      var d3xAxis = d3.axisTop(x)
        .tickValues([])
        .tickSize(0);
      
      var d3yAxis = d3.axisLeft(y)
        .tickValues([])
        .tickSize(0);
      
      const xAxis = g.append('g')
        .attr("transform", `translate(0, ${height})`)
        .call(d3xAxis)
      
      const yAxis = g.append('g')
        .call(d3yAxis);
      
      xAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
      yAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
      
    })
  }

  // Getter/Setter
  layer.classAttr = function(value) {
    if (!arguments.length) return classAttr;
    classAttr = value;
    return layer
  };

  layer.xScale = (value) => x(value);
  layer.yScale = (value) => y(value);

  return layer;
}

function createLineLayer(gridLayer) {
  let parentG;
  let lineG;
  let negativeMarkerG;
  let markerG;
  let currentLineIndex = 0;
  let currentHue = -190;

  function init(selection) {
    parentG = selection.append('g');
    lineG = parentG.append('g');
    negativeMarkerG = parentG.append('g');
    markerG = parentG.append('g');
  }

  function drawLine(
    data,
    lineColor=null
    ) {

    currentLineIndex++;
    if (lineColor === null){
      currentHue = (currentHue + 90) % 360;
      lineColor = `hsl(${currentHue}, 50%, 50%)`
    }

    lineG.append('path')
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("d", d3.line()
        .x(d => gridLayer.xScale(d[0]))
        .y(d => gridLayer.yScale(d[1]))
        );
    
    // Drawing negative markers
    const negativeMarkerClass = `negative-marker-line${currentLineIndex}`
    negativeMarkerG.selectAll(`circle.line${currentLineIndex}`)
    .data(data)
    .enter()
    .append("circle")
    .attr("class", negativeMarkerClass)
    .attr("cx", d => gridLayer.xScale(d[0]))
    .attr("cy", d => gridLayer.yScale(d[1]))
    .attr("r", markerSize * 1.5)
    .attr("fill", backgroundColour);  // or background color
    
    // Drawing normal markers
    const markerClass = `marker`
    const markerLineClass = `marker-line${currentLineIndex}`
    markerG.selectAll(`circle.${markerLineClass}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `${markerClass} ${markerLineClass}`)
        .attr("cx", d => gridLayer.xScale(d[0]))
        .attr("cy", d => gridLayer.yScale(d[1]))
        .attr("r", markerSize)
        .attr("fill", lineColor);
    console.log("Hello")
    }

  return {
    init: init,
    add: function(data, lineColor) {
      drawLine(data, lineColor);
      return this;
    }
  };
}


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

function ran() {
  return [
    [0, Math.random()*25],
    [1, Math.random()*25],
    [2, Math.random()*25],
    [3, Math.random()*25],
    [4, Math.random()*25],
    [5, Math.random()*25]
  ]
}

var svg = d3.select(".area")
  .append("svg")
  .attr("width", width + 2*margin)
  .attr("height", height + 2*margin)
  .attr("viewBox", [0, 0, width + 2*margin, height + 2*margin])
  .append("g")
    .attr("transform", `translate(${margin}, ${margin})`)


const gridLayer = createGridLayer()
svg.call(gridLayer)

const lineLayer = createLineLayer(gridLayer)
lineLayer.init(svg);
lineLayer
  .add(data)
  .add(data2)
  .add(ran())
  .add(ran())
