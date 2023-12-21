import {
    ParticleSystem,
    Particle2D,
    Entity2D,
    CircleCollider,
    LineCollider
} from '../physics.js'

import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition,
    addDefaultStyles
} from '../plotting.js'

const backgroundColour = `hsl(180, 0%, 5%)`
document.body.style.backgroundColor = backgroundColour
const margin = 0
const height = 800
const width = 800

var svg = createSVG(".area", width, height)
addDefaultStyles()

const gridLayer = new GridLayer(svg, {
    height: height,
    xDomain: [-5, 5],
    xRange: [0, width],
    yDomain: [0, 10],
    yRange: [height, 0],
    margin: margin
})

gridLayer.setYAxesCenter(0)
gridLayer.setXAxesCenter(0)

const lineLayer = new LineLayer(svg, gridLayer)

function generatePoints() {
    let result = []
    for (let i = -5; i <= 5; i += 0.2) {
        result.push([i, 5 - 5 * Math.exp(-(i ** 2) / (2 * 1 ** 2))])
    }
    return result
}



let particleManager = new ParticleSystem()

function dydt(t, state, kwargs) {
    let derivatives = new Array(state.length);
    let N = state.length / 4; // Number of particles

    for (let i = 0; i < N; i++) {
        let baseIndex = i * 4;
        let [x, y, xVel, yVel] = state.slice(baseIndex, baseIndex + 4);

        derivatives[baseIndex] = xVel;
        derivatives[baseIndex + 1] = yVel;
        derivatives[baseIndex + 2] = 0;
        derivatives[baseIndex + 3] = -1;
    }
    return derivatives;
}

let lines = [];
let particle
for (let i = 0; i < 200; i++) {
    particle = new Particle2D({
        mass: 1,
        radius: 0.05,
        x: -3 + Math.random() * 6,
        y: 6 + Math.random(),
        xVel: 0,
        yVel: 0,
        collider: new CircleCollider({
            radius: 0.05
        })
    })
    particleManager.addDynamicObject(particle)
    lines.push(lineLayer.add({
        data: [[particle.x, particle.y]],
        color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
        strokeWidth: -1,
        markerSize: Math.min(
            Math.abs(gridLayer.yScale(0) - gridLayer.yScale(particle.radius)),
            Math.abs(gridLayer.xScale(0) - gridLayer.xScale(particle.radius))),
        markerShadowSize: -1
    }))
}

let points = generatePoints()
for (let i = 0; i < points.length - 1; i++) {
    particleManager.addStaticObject(
        new Entity2D({
            x: points[i][0],
            y: points[i][1],
            collider: new LineCollider({
                x2: points[i + 1][0],
                y2: points[i + 1][1]
            })
        }
        )
    )
}
lines.push(lineLayer.add({
    data: points,
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: 2,
    markerSize: -1,
    markerShadowSize: -1
}))


DebugPosition(gridLayer)

var interval = d3.interval(() => {
    particleManager.update(dydt)
    for (let i = 0; i < particleManager.dynamicEntities.length; i++) {
        let particle = particleManager.dynamicEntities[i]
        let line = lines[i]
        line.update({
            data: [[particle.x, particle.y]],
        })
    }
})
