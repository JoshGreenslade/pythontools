import euler from './integrators.js'
import { createGridLayer, LineLayer } from './plotting.js'

const aspect_ratio = 8.0 / 3.0
const height = 500
const width = height * aspect_ratio
const margin = 30
const markerColor = "hsl(0, 50%, 50%)"
const markerSize = 1
const backgroundColour = "hsl(0, 0%, 20%)"
document.body.style.backgroundColor = backgroundColour


let data = [
]
let data2 = [
]



var svg = d3.select(".area")
    .append("svg")
    .attr("width", width + 2 * margin)
    .attr("height", height + 2 * margin)
    .attr("viewBox", [0, 0, width + 2 * margin, height + 2 * margin])
    .append("g")
    .attr("transform", `translate(${margin}, ${margin})`)

const gridLayer = createGridLayer()
svg.call(gridLayer)

const lineLayer = new LineLayer(svg, gridLayer)
let line1 = lineLayer.add({ data: data })
let line2 = lineLayer.add({ data: data2 })
let line3 = lineLayer.add({ data: data2 })
let result
let y0 = [1]
let t = 0

var intervalId = window.setInterval(function () {
    result = euler({
        dydt: (t, y) => [y],
        y0: y0,
        t_span: [t, t + 1],
        n_steps: 1
    })

    data = data.concat([[t, result[1][1][0]]]);
    data2 = data2.concat([[t, 32 - result[1][1][0]]]);
    y0 = result[1].slice(-1)[0];
    line1.update({ data: data })
    line2.update({ data: data2 })
    if (result[1][1][0] > 100) {
        clearInterval(intervalId)
    }
    t += 1
    console.log(result)
}, 500);