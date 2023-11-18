const fadeInTime = 100


// ==========
// SVG
// ==========

export function createSVG(selector, width, height, margin) {
  return d3.select(`${selector}`)
    .append("svg")
    .attr("width", width + 2 * margin)
    .attr("height", height + 2 * margin)
    .attr("viewBox", [0, 0, width + 2 * margin, height + 2 * margin])
    .append("g")
    .attr("transform", `translate(${margin}, ${margin})`)
}

// ==========
// Coordinate systems
// ==========
export class GridLayer {
  constructor(svg, {
    height = null,
    width = null,
    xScale = d3.scaleLinear,
    xDomain = [-1, 1],
    xRange = null,
    yScale = d3.scaleLinear,
    yDomain = [-1, 1],
    yRange = null
  } = {}) {

    this.svg = svg

    if (height === null) {
      height = this.svg.node().parentNode.getAttribute("height")
    }
    this.height = height
    if (width === null) {
      width = this.svg.node().parentNode.getAttribute("width")
    }
    this.width = width
    if (xRange === null) {
      xRange = [0, this.width]
    }
    if (yRange === null) {
      yRange = [this.height, 0]
    }


    this.xScale = xScale()
      .domain(xDomain)
      .range(xRange)
    this.yScale = yScale()
      .domain(yDomain)
      .range(yRange)

    const self = this;

    this.svg.each(function () {
      let g = d3.select(this)
        .append('g')

      var d3xAxis = d3.axisTop(self.xScale)
        .tickValues([])
        .tickSize(0);

      var d3yAxis = d3.axisLeft(self.yScale)
        .tickValues([])
        .tickSize(0);

      const xAxis = g.append('g')
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${self.height})`)
        .call(d3xAxis)

      const yAxis = g.append('g')
        .attr("class", "y-axis")
        .call(d3yAxis);

      xAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
      yAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
    })
  }

  setAxesCenter(x, y) {
    // Calculate the middle of the SVG using the scales
    const xCenter = this.xScale(x);
    const yCenter = this.yScale(y);

    // Update the axes on the SVG to the calculated center
    this.svg.selectAll('g > .x-axis').attr("transform", `translate(0, ${yCenter})`);
    this.svg.selectAll('g > .y-axis').attr("transform", `translate(${xCenter}, 0)`);
  }
}

// ==========
// Lines
// ==========

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
    this.markerSize = markerSize || 0
    this.id = `LineID-${Math.random().toString(36).substr(2, 9)}`;  // Generating a random ID for the line

    this.draw()
  }

  generateColor() {
    this.lineLayer.currentHue = (this.lineLayer.currentHue + 90) % 360
    return `hsl(${this.lineLayer.currentHue}, 50%, 50%)`;
  }

  _drawline() {
    this.data.sort((a, b) => a[0] - b[0]);
    this.pathSelection = this.lineGroup.selectAll(`path#${this.id}`).data([this.data]);

    this.pathSelection
      .enter()
      .append('path')
      .attr('id', this.id)
      .attr('fill', this.color)
      .attr('stroke', this.color)
      .attr('stroke-width', this.strokeWidth)
      .attr('d', d3.line()
        .x(d => this.lineLayer.gridLayer.xScale(d[0]))
        .y(d => this.lineLayer.gridLayer.yScale(d[1]))
      )

    // this.pathSelection
    //   .enter()
    //   .append('path')
    //   .merge(this.pathSelection)
    //   .attr('id', this.id)
    //   .attr('fill', this.color)
    //   .attr('stroke', this.color)
    //   .attr('opacity', 0.9)
    //   .attr('stroke-width', this.strokeWidth)
    //   .attr('d', d3.area()
    //     .x((d) => this.lineLayer.gridLayer.xScale(d[0]))
    //     .y0(this.lineLayer.gridLayer.yScale(0)) // Use -1 since your yDomain starts at -1
    //     .y1((d) => this.lineLayer.gridLayer.yScale(d[1]))
    // )


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

  remove() {
    if (this.pathSelection) {
      this.pathSelection.remove();
    }
    if (this.negMarkerSelection) {
      this.negMarkerSelection.remove();
    }
    if (this.markerSelection) {
      this.markerSelection.remove();
    }
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
    return new Line(this, {
      data: config.data,
      color: config.color,
      strokeWidth: config.strokeWidth,
      marker: config.marker,
      markerSize: config.markerSize
    })
  }
}