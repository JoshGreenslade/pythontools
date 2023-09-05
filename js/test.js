import euler from './integrators.js'
import { GridLayer, LineLayer } from './plotting.js'

const margin = 100
const backgroundColour = `hsl(0, 0%, 90%)`
document.body.style.backgroundColor = backgroundColour


function gauss(x,t) {
    const a = 1e-1
    const hbar = 1.0
    const m = 1e0
    const pre = (a/(Math.sqrt(a*a + (hbar*t/m)**2)))**3
    const post= Math.exp(-1*a*(x-x0)*(x-x0)/(a**2 + (hbar*t/m)**2))
    return pre*post
}

function generateDataForTime(t) {
    const xGrid = generate1DGrid();

    // Calculate squared magnitudes for each x value
    const squaredMagnitudes = xGrid.map(x => math.abs(gauss(x, t)) ** 2);

    // Calculate the sum of these squared magnitudes
    const sum = squaredMagnitudes.reduce((acc, val) => acc + val, 0);
    
    // Normalize the data by dividing each squared magnitude by the square root of the sum
    const normalizedData = squaredMagnitudes.map(val => {
        return val / sum });

    // For plotting, you'd probably want x, val pairs:
    const data = xGrid.map((x, index) => [x, normalizedData[index]]);
    
    return data;
}




const height = 500
const aspect_ratio = 8.0 / 3.0
const width = height * aspect_ratio

const L = 1
const gridPoints = 250
let x0 = 0.0;  // Initially centered at x = 0.
let data = generateDataForTime(0);

var svg = d3.select(".area")
    .append("svg")
    .attr("width", width + 2 * margin)
    .attr("height", height + 2 * margin)
    .attr("viewBox", [0, 0, width + 2 * margin, height + 2 * margin])
    .append("g")
    .attr("transform", `translate(${margin}, ${margin})`)

const gridLayer = new GridLayer(svg, {
    height: height,
    yDomain: [0, 0.01],
    yRange: [height, 0]
})

const lineLayer = new LineLayer(svg, gridLayer)

let line1 = lineLayer.add({ 
    data: data, 
    color: `hsl(-90, 50%, 50%)`,
    strokeWidth: 0,
    markerSize: 0})

let t = 0.0
let step = 0.001
let isMouseDown = false;


function generate1DGrid() {
    const dx = 2 * L / (gridPoints - 1);
    const grid = new Array(gridPoints);
    for(let i=0; i < gridPoints; i++) {
        grid[i] = -L + i * dx;
    }
    return grid
}

var intervalId = window.setInterval(function () {
    data = generateDataForTime(t);
    line1.update({ data: data})
    t += step
}, 10);


d3.select("svg")
    .on("mousedown", function() {
        isMouseDown = true;
    })

    .on("mousemove", function(event) {
        if (isMouseDown){
            // Get the clicked position relative to the SVG.
            const coords = d3.pointer(event);
            console.log(gridLayer.xScale(coords[1]))
    
            // Convert pixel coordinates to your domain values. 
            const clickedX = gridLayer.xScale.invert(coords[0]);
    
            // Update x0 and reset t.
            x0 = clickedX;
            t = 0.0;
            data = generateDataForTime(t)
            line1.update({ data: data});
    
            // Clear the current interval.
            clearInterval(intervalId);
        }
    })
    .on("mouseup", function() {
        isMouseDown = false;
        // Restart the interval function.
        intervalId = window.setInterval(function() {
            data = generateDataForTime(t);
            line1.update({ data: data});
            t += step;
        }, 10);
    })
    .on("mouseleave", function() {
        isMouseDown = false;
    })
