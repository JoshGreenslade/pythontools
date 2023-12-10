import {
    GridLayer,
    LineLayer,
    createSVG,
    addDefaultStyles
} from '../plotting.js'

// ========== SETUP ==========

const BACKGROUNDCOLOR = `hsl(270, 50%, 5%)`
const HEIGHT = 800
const WIDTH = 800
const MARGIN = 150
const XDOMAIN = [-1, 1]
const YDOMAIN = [-1, 1]

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


// ========== Creating A Grid ==========

function getRotationMatrixX(theta) {
    return [
        [1, 0, 0],
        [0, Math.cos(theta), -Math.sin(theta)],
        [0, Math.sin(theta), Math.cos(theta)]
    ];
}

function getRotationMatrixY(theta) {
    return [
        [Math.cos(theta), 0, -Math.sin(theta)],
        [0, 1, 0],
        [Math.sin(theta), 0, Math.cos(theta)]
    ];
}

function getRotationMatrixZ(theta) {
    return [
        [Math.cos(theta), -Math.sin(theta), 0],
        [Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 1]
    ];
}

function project3Dto2D(inputPoint) {
    let point = [[inputPoint[0]], [inputPoint[1]], [inputPoint[2]]];
    console.log(point)
    // 45 degrees rotation around the X-axis
    let rotationX = getRotationMatrixX(-90 * Math.PI / 180);
    let rotatedAroundX = multiplyMatrices(rotationX, point);

    // 45 degrees rotation around the Z-axis
    let rotationZ = getRotationMatrixY(45 * Math.PI / 180);
    let rotatedAroundZ = multiplyMatrices(rotationZ, rotatedAroundX);

    let rotation3 = getRotationMatrixX(30 * Math.PI / 180);
    let rotated3 = multiplyMatrices(rotation3, rotatedAroundZ);


    // let rotationY = getRotationMatrixY(0);
    // let rotatedAroundY = multiplyMatrices(rotationY, rotatedAroundZ);


    // Return the x and y coordinates (ignoring z)
    return [rotated3[0][0], rotated3[1][0]];
}

function multiplyMatrices(a, b) {
    let result = new Array(a.length).fill(0).map(row => new Array(b[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((_, j) => {
            return a[i].reduce((sum, elm, k) => sum + (elm * b[k][j]), 0)
        });
    });
}

const NLINESPERSIDE = 16
const XEXTENT = [-1, 1]
const YEXTENT = [-1, 1]
const MARKERSIZE = 0
const MARKERSHADOWSIZE = 0
const STROKEWIDTH = 1
const GRIDCOLOR = `hsl(0, 0%, 50%)`

for (let i = 0; i < NLINESPERSIDE + 1; i++) {

    let dataY = Array((NLINESPERSIDE + 1))
        .fill(1)
        .map((_, j) => project3Dto2D([
            XEXTENT[0] + i * (XEXTENT[1] - XEXTENT[0]) / NLINESPERSIDE,
            YEXTENT[0] + j * (YEXTENT[1] - YEXTENT[0]) / NLINESPERSIDE,
            ((XEXTENT[0] + i * (XEXTENT[1] - XEXTENT[0]) / NLINESPERSIDE) === 0) &&
                ((YEXTENT[0] + j * (YEXTENT[1] - YEXTENT[0]) / NLINESPERSIDE) === 0) ? -0.5 : 0])
        )

    let dataX = Array((NLINESPERSIDE + 1))
        .fill(1)
        .map((_, j) => project3Dto2D([
            YEXTENT[0] + j * (YEXTENT[1] - YEXTENT[0]) / NLINESPERSIDE,
            XEXTENT[0] + i * (XEXTENT[1] - XEXTENT[0]) / NLINESPERSIDE,
            ((XEXTENT[0] + i * (XEXTENT[1] - XEXTENT[0]) / NLINESPERSIDE) === 0) &&
                ((YEXTENT[0] + j * (YEXTENT[1] - YEXTENT[0]) / NLINESPERSIDE) === 0) ? -0.5 : 0])
        )

    console.log(dataX)
    lineLayer.add({
        data: dataY,
        color: GRIDCOLOR,
        markerSize: MARKERSIZE,
        markerShadowSize: MARKERSHADOWSIZE,
        strokeWidth: STROKEWIDTH
    })
    lineLayer.add({
        data: dataX,
        color: GRIDCOLOR,
        markerSize: MARKERSIZE,
        markerShadowSize: MARKERSHADOWSIZE,
        strokeWidth: STROKEWIDTH
    })
}
