import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition
} from '../plotting.js'

// ========== CONSTANTS ==========
const SCALE = 2.5;
const BACKGROUNDCOLOUR = `hsl(225, 50%, 5%)`;
const WIDTH = 750 * SCALE;
const HEIGHT = 250 * SCALE;
const MARGIN = 10;

// ========== SETUP ==========
document.body.style.backgroundColor = BACKGROUNDCOLOUR;
document.body.style.margin = 0;

var svg = createSVG('#svg', WIDTH, HEIGHT)
var grid = new GridLayer(svg, {
    height: HEIGHT,
    width: WIDTH,
    xDomain: [-1, 1],
    xRange: [0, WIDTH],
    yDomain: [0, 5],
    yRange: [HEIGHT, 0],
    margin: MARGIN
})
grid.setYAxesCenter(0);
grid.setXAxesCenter(0);

const lineLayer = new LineLayer(svg, grid)
// DebugPosition(grid)

// ========== ACTUAL FUNCTIONS ==========

function gaussian(x, mean, standardDeviation) {
    const factor = 1 / (standardDeviation * Math.sqrt(2 * Math.PI));
    const exponent = Math.exp(-0.5 * Math.pow((x - mean) / standardDeviation, 2));
    return factor * exponent;
}

function gaussianRange(start, end, step, mean, standardDeviation) {
    const range = [];
    for (let x = start; x <= end; x += step) {
        range.push([x, gaussian(x, mean, standardDeviation)]);
    }
    return range;
}

const gaussianValues = gaussianRange(-1, 1, 0.005, 0, 0.1);
let line = lineLayer.add({
    data: gaussianValues,
    color: `hsl(0, 50%, 50%)`,
    strokeWidth: 1,
    markerSize: 3,
    markerShadowSize: 0
})

let targetMean = 0;
let targetSD = 0.1;
let currentMean = 0;
let currentSD = 0.1;
let alpha = 0.08;

function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

function animate() {
    currentMean = lerp(currentMean, targetMean, alpha);
    currentSD = lerp(currentSD, targetSD, alpha);

    line.update({
        data: gaussianRange(-1, 1, 0.005, currentMean, currentSD)
    });

    requestAnimationFrame(animate);
}

grid.svg.on("mousemove", function (event) {
    const coords = d3.pointer(event);
    targetMean = grid.xScale.invert(coords[0]);
    targetSD = Math.max(0, grid.yScale.invert(coords[1]) / 10);
});

// Start the animation loop
requestAnimationFrame(animate);