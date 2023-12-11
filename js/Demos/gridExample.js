import {
    GridLayer,
    LineLayer,
    createSVG,
    Grid,
    addDefaultStyles
} from '../plotting.js'

import {
    get3DRotationMatrixX,
    get3DRotationMatrixY,
    get3DRotationMatrixZ,
    multiplyMatrices
} from '../maths.js'

// ========== SETUP ==========

// GridLayer config
const BACKGROUNDCOLOR = `hsl(270, 50%, 5%)`
const HEIGHT = 1200
const WIDTH = 1200
const MARGIN = 200
const XDOMAIN = [-1, 1]
const YDOMAIN = [-1, 1]

// Grid config
const NLINESPERSIDE = 41

document.body.style.backgroundColor = BACKGROUNDCOLOR
addDefaultStyles()

const svg = createSVG('#svg', WIDTH, HEIGHT)

const gridLayer = new GridLayer(svg, {
    height: HEIGHT,
    width: WIDTH,
    xRange: [0, WIDTH],
    xDomain: XDOMAIN,
    yRange: [HEIGHT, 0],
    yDomain: YDOMAIN,
    margin: MARGIN
})
gridLayer.setXAxesCenter(-2)
gridLayer.setYAxesCenter(-2)
gridLayer.addXAxesLabel("$$\\large{q_1}$$")
gridLayer.addYAxesLabel("$$\\large{q_2}$$")

const lineLayer = new LineLayer(svg, gridLayer)

const grid = new Grid(gridLayer, lineLayer, {
    linesPerSide: NLINESPERSIDE,
    markerSize: 0,
    markerShadowSize: 0,
    strokeWidth: 1,
    gridColor: `hsl(180, 0%, 100%)`
})

// ==================================
// ========== General Play ==========
// ==================================

let t = 0

function animate() {
    t += 0.05

    grid.update({
        data: grid.data.map(i => [i[0], i[1], Math.sin(t) * Math.exp(((-1 * i[0] ** 2) / 0.1) + ((-1 * i[1] ** 2)) / 0.1)]),
    })

    lineLayer.zRotation = 45 + 2 * t
    lineLayer.xRotation = 10 + 4 * t

    requestAnimationFrame(animate)
};

requestAnimationFrame(animate)