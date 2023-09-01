const aspect_ratio = 8.0 / 3.0
const height = 500
const width = height * aspect_ratio
const margin = 30
const markerColor = "hsl(0, 50%, 50%)"

const backgroundColour = "hsl(0, 0%, 20%)"
const fadeInTime = 100

// document.body.style.backgroundColor = backgroundColour

export function createGridLayer() {
  let classAttr = "grid-layer"

  let x = d3.scaleLinear()
    .domain([0, 5])
    .range([0, width])

  let y = d3.scaleLinear()
    .domain([0, 32])
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
    strokeWidth = null,
    marker = null,
    markerSize = null
  }) {
    this.lineLayer = lineLayer
    this.lineGroup = lineLayer.lineGroup
    this.negMarkerGroup = lineLayer.negMarkerGroup
    this.markerGroup = lineLayer.markerGroup
    this.data = data
    this.color = color || this.generateColor()
    this.strokeWidth = strokeWidth || 1
    this.marker = marker || 'circle'
    this.markerSize = markerSize || 10
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
      .attr('d', d3.line()
        .x(d => this.lineLayer.gridLayer.xScale(d[0]))
        .y(d => this.lineLayer.gridLayer.yScale(d[1]))
      )

    this.pathSelection
      .enter()
      .append('path')
      .attr('id', this.id)
      .attr('fill', 'none')
      .attr('stroke', `hsl(${this.lineLayer.currentHue}, 50%, 50%)`)
      .attr('stroke-width', this.strokeWidth)
      .attr('d', d3.line()
        .x(d => this.lineLayer.gridLayer.xScale(d[0]))
        .y(d => this.lineLayer.gridLayer.yScale(d[1]))
      )


    this.pathSelection.exit().remove()
  }

  _drawNegMarker() {
    const negativeMarkerID = `negMarker${this.id}`
    this.negMarkerSelection = this.negMarkerGroup.selectAll(`circle#${negativeMarkerID}`).data(this.data);

    this.negMarkerSelection
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]))

    this.negMarkerSelection
      .enter()
      .append("circle")
      .attr("id", negativeMarkerID)
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]))
      .attr("r", this.markerSize * 1.5)
      .attr("fill", document.body.style.backgroundColor)
      .style("opacity", 0)
      .transition().duration(fadeInTime).style("opacity", 1);

    this.negMarkerSelection.exit().remove()
  }

  _drawMarker() {
    const markerID = `marker${this.id}`
    this.markerSelection = this.markerGroup.selectAll(`circle#${markerID}`).data(this.data);

    this.markerSelection
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]))

    this.markerSelection
      .enter()
      .append("circle")
      .attr("id", markerID)
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]))
      .attr("r", this.markerSize)
      .attr("fill", this.color)
      .style("opacity", 0)
      .transition().duration(fadeInTime).style("opacity", 1);

    this.markerSelection.exit().remove()
  }

  draw() {
    this._drawline()
    this._drawNegMarker()
    this._drawMarker()
  };

  update({ data = null,
    color = null,
    strokeWidth = null,
    markerSize = null
  }) {
    if (data !== null) {
      this.data = data
    }
    if (strokeWidth !== null) {
      this.strokeWidth = strokeWidth
      this.pathSelection.attr("stroke-width", this.strokeWidth)
    }
    if (markerSize !== null) {
      this.markerSize = markerSize
      this.negMarkerSelection.attr("r", 1.5 * this.markerSize)
      this.markerSelection.attr("r", this.markerSize)
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