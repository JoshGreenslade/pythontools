const aspect_ratio = 8.0 / 3.0
const height = 500
const width = height * aspect_ratio
const margin = 30
const markerColor = "hsl(0, 50%, 50%)"
const markerSize = 1
const backgroundColour = "hsl(0, 0%, 20%)"

// document.body.style.backgroundColor = backgroundColour

export function createGridLayer() {
  let classAttr = "grid-layer"

  let x = d3.scaleLinear()
    .domain([0, 5])
    .range([0, width])

  let y = d3.scaleLinear()
    .domain([0, 25])
    .range([height, 0])

  function layer(selection) {
    selection.each(function () {
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
  layer.classAttr = function (value) {
    if (!arguments.length) return classAttr;
    classAttr = value;
    return layer
  };

  layer.xScale = (value) => x(value);
  layer.yScale = (value) => y(value);

  return layer;
}

class Line {
  constructor(lineLayer, {
    data,
    color = null,
    marker = null
  }) {
    this.lineLayer = lineLayer
    this.lineGroup = lineLayer.lineGroup
    this.negMarkerGroup = lineLayer.negMarkerGroup
    this.markerGroup = lineLayer.markerGroup
    this.data = data
    this.color = color || this.generateColor()
    this.marker = marker || 'circle'
    this.id = `LineID-${Math.random().toString(36).substr(2, 9)}`;  // Generating a random ID for the line

    this.draw()
  }

  generateColor() {
    this.lineLayer.currentHue = (this.lineLayer.currentHue + 90) % 360
    return `hsl(${this.lineLayer.currentHue}, 50%, 50%)`;
  }

  _drawline() {
    this.pathSelection = this.lineGroup.selectAll(`path#${this.id}`).data([this.data]);
    this.pathSelection
      .enter()
      .append('path')
      .merge(this.pathSelection)
      .attr('id', this.id)
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('d', d3.line()
        .x(d => this.lineLayer.gridLayer.xScale(d[0]))
        .y(d => this.lineLayer.gridLayer.yScale(d[1]))
      );
    this.pathSelection.exit().remove()
  }

  _drawNegMarker() {
    const negativeMarkerID = `negMarker${this.id}`
    this.negMarkerSelection = this.negMarkerGroup.selectAll(`circle#${negativeMarkerID}`).data(this.data);
    this.negMarkerSelection
      .enter()
      .append("circle")
      .merge(this.negMarkerSelection)
      .attr("id", negativeMarkerID)
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]))
      .attr("r", markerSize * 1.5)
      .attr("fill", document.body.style.backgroundColor);

    this.negMarkerSelection.exit().remove()
  }

  _drawMarker() {
    const markerID = `marker${this.id}`
    this.markerSelection = this.markerGroup.selectAll(`circle#${markerID}`).data(this.data);
    this.markerSelection
      .enter()
      .append("circle")
      .merge(this.markerSelection)
      .attr("id", markerID)
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]))
      .attr("r", markerSize)
      .attr("fill", this.color);

    this.markerSelection.exit().remove()
  }

  draw() {
    this._drawline()
    this._drawNegMarker()
    this._drawMarker()
  };

  update({ data = null, color = null }) {
    if (data !== null) {
      this.data = data
    }
    if (color !== null) {
      this.color = color
      this.pathSelection.attr("stroke", this.color)
    }

    this.draw()
  }
}

export class LineLayer {

  constructor(svg, gridLayer) {
    this.svg = svg
    this.gridLayer = gridLayer
    this.lineGroup = svg.append('g')
    this.negMarkerGroup = svg.append('g')
    this.markerGroup = svg.append('g')

    this.currentHue = -190
  }

  add(config) {
    return new Line(this, { data: config.data, color: config.color })
  }
}


// let data = [
//   [0, 0],
//   [1, 1],
//   [2, 4],
//   [3, 9],
//   [4, 16],
//   [5, 25]
// ]


// let data2 = [
//   [0, 25],
//   [1, 16],
//   [2, 9],
//   [3, 8],
//   [4, 2],
//   [5, 0]
// ]

// var svg = d3.select(".area")
//   .append("svg")
//   .attr("width", width + 2 * margin)
//   .attr("height", height + 2 * margin)
//   .attr("viewBox", [0, 0, width + 2 * margin, height + 2 * margin])
//   .append("g")
//   .attr("transform", `translate(${margin}, ${margin})`)


// const gridLayer = createGridLayer()
// svg.call(gridLayer)

// const lineLayer = new LineLayer(svg, gridLayer)
// line1 = lineLayer.add({ data: data2 })
// line2 = lineLayer.add({ data: [] })

// var intervalId = window.setInterval(function () {
//   data = data.concat([[Math.random() * 5, Math.random() * 25]])
//   if (data.length > 25) {
//     data = data.slice(-25)
//   }
//   line2.update({ data: data })
// }, 500);