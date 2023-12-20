import {
  get3DRotationMatrixX,
  get3DRotationMatrixY,
  get3DRotationMatrixZ,
  multiplyMatrices
} from './maths.js'

// ============================
// =========== SVGs ===========
// ============================

export function createSVG(selector, width, height) {
  const svg = d3.select(`${selector}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .append("g")

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "transparent");

  return svg;
}

export function addDefaultStyles() {
  var style = document.createElement('style');
  style.type = 'text/css'

  var css = `
    body,
    html {
      height: 100%;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    mjx-container[jax="CHTML"][display="true"] {
      display: inline !important;
      margin: 0 !important;
    }
  `

  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

// ============================
// ==== Coordinate Systems ====
// ============================

export class GridLayer {
  constructor(svg, {
    height = null,
    width = null,
    xScale = d3.scaleLinear,
    xDomain = [-1, 1],
    xRange = null,
    yScale = d3.scaleLinear,
    yDomain = [-1, 1],
    yRange = null,
    margin = 50
  } = {}) {

    this.svg = svg
    this.XDomain = xDomain
    this.YDomain = yDomain

    if (height === null) {
      height = this.svg.node().parentNode.getAttribute("height") - margin
    }
    this.height = height
    if (width === null) {
      width = this.svg.node().parentNode.getAttribute("width") - margin
    }
    this.width = width
    if (xRange === null) {
      xRange = [0, this.width + margin]
    }
    else {
      xRange = [xRange[0] + margin, xRange[1] - margin]
    }
    if (yRange === null) {
      yRange = [this.height + margin, 0]
    }
    else {
      yRange = [yRange[0] - margin, yRange[1] + margin]
    }

    this.margin = margin

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
        .attr("class", "axis")

      var d3xAxis = d3.axisTop(self.xScale)
        .tickValues([])
        .tickSize(0);

      var d3yAxis = d3.axisLeft(self.yScale)
        .tickValues([])
        .tickSize(0);

      const xAxis = g.append('g')
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${self.height - self.margin})`)
        .call(d3xAxis)

      const yAxis = g.append('g')
        .attr("class", "y-axis")
        .attr("transform", `translate(${self.margin}, 0)`)
        .call(d3yAxis);

      xAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
      yAxis.attr("style", "color: hsl(0, 0%, 50%); stroke-width: 2px;")
    })
  }


  setXAxesCenter(x) {
    const xCenter = this.yScale(x);
    this.svg.selectAll('g > .x-axis').attr("transform", `translate(0, ${xCenter})`);
  }

  setYAxesCenter(y) {
    const yCenter = this.xScale(y);
    this.svg.selectAll('g > .y-axis').attr("transform", `translate(${yCenter}, 0)`);
  }

  addXAxesLabel(text) {
    const xLabel = this.svg.select('.x-axis')
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', this.width - this.margin)
      .attr('y', -5)
      .attr('class', 'axis-label')
      .style('font-family', 'serif') // Set the font to a serif family
      .style('font-size', '20px') // Set the font size to 20px
      .text(text)

    const bbox = xLabel.node().getBBox();
    console.log(bbox)
    xLabel.remove();

    this.svg.select('.x-axis')
      .append('foreignObject')
      .attr('width', bbox.width * 5)
      .attr('height', bbox.height * 5)
      .attr('text-anchor', 'start')
      .attr('y', bbox.y)
      .attr('x', bbox.x)
      .attr('class', 'axis-label')
      .style('font-family', 'serif') // Set the font to a serif family
      .style('font-size', '20px') // Set the font size to 20px
      .text(text)
  }

  addYAxesLabel(text) {
    const yLabel = this.svg.select('.y-axis')
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', 5)
      .attr('y', this.margin)
      .attr('class', 'axis-label')
      .style('font-family', 'serif') // Set the font to a serif family
      .style('font-size', '20px') // Set the font size to 20px
      .text(text)

    const bbox = yLabel.node().getBBox();
    console.log(bbox)
    yLabel.remove();

    this.svg.select('.y-axis')
      .append('foreignObject')
      .attr('width', bbox.width * 5)
      .attr('height', bbox.height * 5)
      .attr('text-anchor', 'start')
      .attr('color', 'hsl(0, 0%, 50%)')
      .attr('y', bbox.y)
      .attr('x', bbox.x)
      .attr('class', 'axis-label')
      .style('font-family', 'serif') // Set the font to a serif family
      .style('font-size', '20px') // Set the font size to 20px
      .text(text)
  }
}

// =============================
// =========== Lines ===========
// =============================

class Line {
  constructor(lineLayer, {
    data,
    color = null,
    strokeWidth = null,
    marker = null,
    markerSize = null,
    markerShadowSize = null
  }) {
    this.lineLayer = lineLayer
    this.lineGroup = lineLayer.lineGroup
    this.negMarkerGroup = lineLayer.negMarkerGroup
    this.markerGroup = lineLayer.markerGroup
    this.data = lineLayer.transform(data)
    this.color = color || this.generateColor()
    this.strokeWidth = strokeWidth || 0
    this.marker = marker || 'circle'
    this.markerSize = markerSize || 0
    this.markerShadowSize = markerShadowSize || 1.5 * this.markerSize
    this.id = `LineID-${Math.random().toString(36).substr(2, 9)}`;  // Generating a random ID for the line

    this.draw()
  }

  generateColor() {
    this.lineLayer.currentHue = (this.lineLayer.currentHue + 90) % 360
    return `hsl(${this.lineLayer.currentHue}, 50%, 50%)`;
  }

  _drawline() {
    // this.data.sort((a, b) => a[0] - b[0]);
    this.pathSelection = this.lineGroup.selectAll(`path#${this.id}`).data([this.data]);
    this.pathSelection
      .enter()
      .append('path')
      .attr('id', this.id)
      .attr('fill', "none")
      .attr('stroke', this.color)
      .attr('stroke-width', this.strokeWidth)
      .merge(this.pathSelection)
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
      .attr("fill", document.body.style.backgroundColor)
      .attr("r", this.markerShadowSize)
      .merge(this.negMarkerSelection)
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]));

    this.negMarkerSelection.exit().remove()
  }

  _drawMarker() {
    const markerID = `marker${this.id}`
    this.markerSelection = this.markerGroup.selectAll(`circle#${markerID}`).data(this.data);

    this.markerSelection
      .enter()
      .append("circle")
      .attr("id", markerID)
      .attr("fill", this.color)
      .attr("r", this.markerSize)
      .style("filter", this.markerSize > 10 ? "url(#glow)" : "none")
      .merge(this.markerSelection)
      .attr("cx", d => this.lineLayer.gridLayer.xScale(d[0]))
      .attr("cy", d => this.lineLayer.gridLayer.yScale(d[1]));

    this.markerSelection.exit().remove()
  }

  draw() {
    if (this.strokeWidth > 0) {
      this._drawline()
    }
    if (this.markerShadowSize > 0) {
      this._drawNegMarker()
    }
    if (this.markerSize > 0) {
      this._drawMarker()
    }
  };

  update({
    data = null,
    color = null,
    strokeWidth = null,
    markerSize = null
  }) {

    if (data !== null) {
      this.data = this.lineLayer.transform(data)
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
      this.markerSelection.attr("fill", this.color)
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

    // 3D rotations
    this.zRotation = 45
    this.xRotation = 10
  }

  add(config) {
    return new Line(this, {
      data: config.data,
      color: config.color,
      strokeWidth: config.strokeWidth,
      marker: config.marker,
      markerSize: config.markerSize,
      markerShadowSize: config.markerShadowSize
    })
  }

  project3Dto2D(data) {
    // Transforms data from 3D to 2D
    // Can be overridden
    const data2d = data.map((inputPoint) => {

      let point = [[inputPoint[0]], [inputPoint[1]], [inputPoint[2]]];
      // 45 degrees rotation around the X-axis
      let rotationX = get3DRotationMatrixX(-90 * Math.PI / 180);
      let rotatedAroundX = multiplyMatrices(rotationX, point);

      // 45 degrees rotation around the Z-axis
      let rotationZ = get3DRotationMatrixY(this.zRotation * Math.PI / 180);
      let rotatedAroundZ = multiplyMatrices(rotationZ, rotatedAroundX);

      let rotation3 = get3DRotationMatrixX(this.xRotation * Math.PI / 180);
      let rotated3 = multiplyMatrices(rotation3, rotatedAroundZ);

      return [rotated3[0][0], rotated3[1][0]];
    })

    return data2d
  }

  transform(data) {
    // Ensure there is data
    if (data.length === 0) {
      return data
    }
    const dimensions = [data.length, data[0].length]
    // 2D points are not transformed
    if (dimensions[1] === 2) {
      return data
    }
    // 3D points are projected down to 2D using transformData
    else if (dimensions[1] === 3) {
      return this.project3Dto2D(data)
    }
  }
}


// =======================================
// ========== 3D Plotting Tools ==========
// =======================================

export class Grid {

  constructor(gridLayer, lineLayer, {
    linesPerSide = 10,
    XExtent = gridLayer.XDomain,
    YExtent = gridLayer.YDomain,
    markerSize = 0,
    markerShadowSize = 0,
    strokeWidth = 1,
    gridColor = `hsl(0, 0%, 50%)`
  }) {
    this.gridLayer = gridLayer
    this.lineLayer = lineLayer
    this.linesPerSide = linesPerSide
    this.XExtent = XExtent
    this.YExtent = YExtent
    this.markerSize = markerSize
    this.markerShadowSize = markerShadowSize
    this.strokeWidth = strokeWidth
    this.gridColor = gridColor
    this.data = this._mapLinesPerSideToGrid()
    this._horizontalLineData = this._getHorizontalLineData()
    this._verticalLineData = this._getVerticalLineData()
    this._lines = []

    this._createInitialLines()

  }

  _mapLinesPerSideToGrid() {
    return Array(this.linesPerSide ** 2).fill(1)
      .map((_, i) => {
        let x = this.XExtent[0] + (i % this.linesPerSide) * (this.XExtent[1] - this.XExtent[0]) / (this.linesPerSide - 1)
        let y = this.YExtent[0] + Math.floor(i / this.linesPerSide) * (this.YExtent[1] - this.YExtent[0]) / (this.linesPerSide - 1)
        return [x, y]
      })
  }

  _getHorizontalLineData() {
    let horizontalLines = [];
    // Creating horizontal lines
    for (let row = 0; row < this.linesPerSide; row++) {
      let lineSegment = [];
      for (let col = 0; col < this.linesPerSide; col++) {
        let pointIndex = row * this.linesPerSide + col;
        lineSegment.push(this.data[pointIndex]);
      }
      horizontalLines.push(lineSegment)
    }
    return horizontalLines
  }

  _getVerticalLineData() {
    let verticalLines = [];
    // Creating vertical lines
    for (let col = 0; col < this.linesPerSide; col++) {
      let lineSegment = [];
      for (let row = 0; row < this.linesPerSide; row++) {
        let pointIndex = row * this.linesPerSide + col;
        lineSegment.push(this.data[pointIndex]);
      }
      verticalLines.push(lineSegment)
    }
    return verticalLines
  }

  _createInitialLines() {
    for (let i = 0; i < this.linesPerSide; i++) {
      this._lines.push(
        this.lineLayer.add({
          data: this.lineLayer.transform(this._horizontalLineData[i]),
          color: this.gridColor,
          strokeWidth: this.strokeWidth,
          markerSize: this.markerSize,
          markerShadowSize: this.markerShadowSize
        })
      )
      this._lines.push(
        this.lineLayer.add({
          data: this.lineLayer.transform(this._verticalLineData[i]),
          color: this.gridColor,
          strokeWidth: this.strokeWidth,
          markerSize: this.markerSize,
          markerShadowSize: this.markerShadowSize
        })
      )
    }
  }

  _updateLines() {
    this._horizontalLineData = this._getHorizontalLineData()
    this._verticalLineData = this._getVerticalLineData()
    for (let i = 0; i < this.linesPerSide; i++) {
      this._lines[2 * i].update({
        data: this.lineLayer.transform(this._horizontalLineData[i])
      })
      this._lines[2 * i + 1].update({
        data: this.lineLayer.transform(this._verticalLineData[i])
      })
    }
  }

  update({
    data = null,
  }) {

    if ((data !== null)) {
      if (data !== null) {
        this.data = data
      }
      this._updateLines()
    }

  }
}

// ==========
// Debug Utils
// ==========


export function DebugPosition(gridLayer) {
  gridLayer.svg
    .on("mousedown", function (event) {
      // Get the clicked position relative to the SVG.
      const coords = d3.pointer(event);

      // Convert pixel coordinates to your domain values. 
      const clickedX = gridLayer.xScale.invert(coords[0]);
      const clickedY = gridLayer.yScale.invert(coords[1]);

      // Log the output
      console.log(`X: ${clickedX.toFixed(4)}\nY: ${clickedY.toFixed(4)}`);
    })
}