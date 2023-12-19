import {
    GridLayer,
    createSVG,
    addDefaultStyles,
    LineLayer
} from '../plotting.js'

// =========== SETUP ==========

const BACKGROUNDCOLOR = 'hsl(0, 0%, 5%)'
const LINECOLOR = `hsl(0, 50%, 50%)`
const HEIGHT = 1000
const WIDTH = 1000
const MARGIN = 50
const XDOMAIN = [-20, 20]
const YDOMAIN = [-20, 20]
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
    markerSize: 3,
    markerShadowSize: -1
})
document.body.style.background = BACKGROUNDCOLOR;


// ========== ACTUAL FUNCTIONS ==========

const tStart = 0
const tStep = 4 * Math.PI / 1000
const maxT = 4 * Math.PI
let t = tStart

function generateValues(start, end, step) {
    const results = [];
    for (let t = start; t <= end; t += step) {
        results.push([16 * Math.sin(t) ** 3,
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)])
    }
    return results
}


function animate() {
    let results = generateValues(t, t + 1, tStep)
    line.update({
        data: [...line.data, results[0]]
    })
    t += tStep

    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
