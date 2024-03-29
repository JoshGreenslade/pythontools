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
    this.data = data
    this.color = color || this.generateColor()
    this.strokeWidth = strokeWidth || 0
    this.marker = marker || 'circle'
    this.markerSize = (this.lineLayer.gridLayer.yScale(0) - this.lineLayer.gridLayer.yScale(markerSize)) || 0
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
}

// ==================================
// ============ Polygons ============
// ==================================


class Polygon {
  constructor(polygonLayer, {
    data,
    color = null,
    strokeWidth = null,
  }) {
    this.polygonLayer = polygonLayer
    this.polygonGroup = polygonLayer.polygonGroup
    this.data = data
    this.color = color || this.generateColor()
    this.strokeWidth = strokeWidth || 0
    this.id = `PolygonID-${Math.random().toString(36).substr(2, 9)}`;  // Generating a random ID for the line

    this.draw()
  }

  draw() {
    let xScale = this.polygonLayer.gridLayer.xScale;
    let yScale = this.polygonLayer.gridLayer.yScale;
    // Ensure the id attribute is set for each polygon
    this.polygonGroup.selectAll(`polygon#${this.id}`)
      .data([this.data]) // Use a key function to bind data by id
      .join(
        enter => enter
          .append("polygon")
          .attr("id", this.id) // Ensure the id is correctly applied
          .attr("stroke", "white")
          .attr("stroke-width", this.strokeWidth)
          .attr("fill", this.color),
        update => update
          .attr("stroke-width", this.strokeWidth)
          .attr("fill", this.color),
        exit => exit.remove()
      )
      .attr("points", this.data[0].map(p => [xScale(p.X), yScale(p.Y)].join(" ")).join(",")
      );
  }
  

  update({
    data = null,
    color = null,
    strokeWidth = null
    }) {

    if (data !== null) {
      this.data = data
    }
    if (strokeWidth !== null) {
      this.strokeWidth = strokeWidth
      this.polygonSelection.attr("stroke-width", this.strokeWidth)
    }
    if (color !== null) {
      this.color = color
      this.polygonSelection.attr("fill", this.color)
    }

    this.draw()
  }

  generateColor() {
    this.polygonLayer.currentHue = (this.polygonLayer.currentHue + 90) % 360
    return `hsl(${this.polygonLayer.currentHue}, 50%, 50%)`;
  }
}

export class PolygonLayer {

  constructor(svg, gridLayer) {
    this.svg = svg
    this.gridLayer = gridLayer
    this.polygonGroup = svg.append('g')
    this.currentHue = -190
  }

  add(config) {
    return new Polygon(this, {
      data: config.data,
      color: config.color,
      strokeWidth: config.strokeWidth
    })
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

export class FramerateDisplay {
  constructor() {
      this.lastFrameTime = performance.now();
      this.averageOverFrames = 20
      this.storedFrameTimes = []
      this.initDisplay();
  }

  initDisplay() {
      // Create the framerate display textbox and append it to the body
      this.framerateDisplay = document.createElement('div');
      this.framerateDisplay.style.position = 'fixed';
      this.framerateDisplay.style.top = '10px';
      this.framerateDisplay.style.left = '10px';
      this.framerateDisplay.style.color = 'white';
      this.framerateDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      this.framerateDisplay.style.border = '1px solid white';
      this.framerateDisplay.style.padding = '5px';
      this.framerateDisplay.style.borderRadius = '5px';
      this.framerateDisplay.style.zIndex = '1000'; // Ensure it's above other elements
      document.body.appendChild(this.framerateDisplay);
      
      this.updateFrameRate();
  }

  updateFrameRate() {
      const now = performance.now();
      const deltaTime = now - this.lastFrameTime;
      const fps = 1000.0 / (deltaTime); // Convert delta time to seconds and calculate FPS
      this.storedFrameTimes.push(fps)
      // Ensure we only keep the last N timestamps
      if (this.storedFrameTimes.length == this.averageOverFrames){
        this.framerateDisplay.textContent = `FPS: ${fps.toFixed(2)}`; // Update the display, rounded to 1 decimal place
        this.storedFrameTimes = []
      }

      this.lastFrameTime = now;
      requestAnimationFrame(this.updateFrameRate.bind(this)); // Continue the loop
  }
}