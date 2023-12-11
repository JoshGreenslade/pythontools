import {
    GridLayer,
    createSVG,
    addDefaultStyles,
    LineLayer
} from '../plotting.js'

// =========== SETUP ==========

const BACKGROUNDCOLOR = 'hsl(0, 0%, 5%)'
const LINECOLOR = `hsl(0, 50%, 50%)`
const HEIGHT = 800
const WIDTH = 800
const MARGIN = 100
const XDOMAIN = [-1, 1]
const YDOMAIN = [-1, 1]
const svg = createSVG('#svg', WIDTH, HEIGHT)
addDefaultStyles()
const grid = new GridLayer(svg, {
    height: HEIGHT,
    width: WIDTH,
    xRange: [0, WIDTH],
    xDomain: XDOMAIN,
    yRange: [HEIGHT, 0],
    yDomain: YDOMAIN,
    margin: MARGIN
})
grid.setXAxesCenter(0)
grid.setYAxesCenter(0)
grid.addXAxesLabel("$$x(t)$$")
grid.addYAxesLabel("$$p(t)$$")

const lineLayer = new LineLayer(svg, grid)
let line = lineLayer.add({
    data: [],
    color: LINECOLOR,
    strokeWidth: 1,
    markerSize: 0,
    markerShadowSize: -1
})
let line2 = lineLayer.add({
    data: [],
    color: `hsl(220, 50%, 50%)`,
    strokeWidth: 1,
    markerSize: 0,
    markerShadowSize: -1
})
document.body.style.background = BACKGROUNDCOLOR;


// ========== ACTUAL FUNCTIONS ==========

const m = 1
const w = 1
const x0 = 0
const p0 = 0.9
const tStart = 0
const tStep = 0.1
const maxT = 700
let t = tStart
let n = 0.1
let n2 = 0

function x(t) {
    return (x0 * Math.cos(w * t) + ((p0) / (m * w)) * Math.sin(w * t)) * Math.cos(n * t / Math.PI)
}
function p(t) {
    return m * w * (((p0) / (m * w)) * Math.cos(w * t) - x0 * Math.sin(w * t)) * Math.cos(n * t / Math.PI)
}

function generateValues(start, end, step) {
    const results = [];
    for (let t = start; t <= end; t += step) {
        results.push([x(t), p(t)])
    }
    return results
}
// line.update({
//     data: generateValues(0,
//         200,
//         0.002)
// })

function animate() {
    line.update({
        data: generateValues(t - maxT * tStep < 0 ? 0 : t - maxT * tStep,
            t,
            tStep)
    })
    t += tStep

    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
