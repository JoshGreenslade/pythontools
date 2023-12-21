import {
    verlet
} from './integrators.js'
import {
    ParticleSystem,
    Particle2D,
    Entity2D,
    AxisAlignedBoundaryBoxCollider,
    CircleCollider,
    LineCollider
} from './physics.js'

import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition
} from './plotting.js'

const backgroundColour = `hsl(180, 0%, 5%)`
document.body.style.backgroundColor = backgroundColour
const margin = 0
const height = 800
const width = 800

var svg = createSVG(".area", width, height)

const gridLayer = new GridLayer(svg, {
    height: height,
    xDomain: [-1, 1],
    xRange: [0, width],
    yDomain: [0, 2],
    yRange: [height, 0],
    margin: margin
})

gridLayer.setYAxesCenter(0)
gridLayer.setXAxesCenter(0)

const lineLayer = new LineLayer(svg, gridLayer)
let dt = 0.001

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

let particle = new Particle2D({
    mass: 1,
    radius: 0.1,
    x: -0.9,
    y: 1.1,
    xVel: 0,
    yVel: 0,
    collider: new CircleCollider({
        radius: 0.1
    })
})
particleManager.addDynamicObject(particle)
lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: -1,
    markerSize: Math.abs(gridLayer.yScale(0) - gridLayer.yScale(particle.radius)),
    markerShadowSize: -1
}))

let diagWall = new Entity2D({
    x: 0,
    y: 0,
    collider: new LineCollider({
        x2: 1,
        y2: 1
    })
})
let diagWall2 = new Entity2D({
    x: 0,
    y: 0,
    collider: new LineCollider({
        x2: -1,
        y2: 1
    })
})

lines.push(lineLayer.add({
    data: [[diagWall2.collider.x2, diagWall2.collider.y2], [diagWall2.x, diagWall2.y], [diagWall.collider.x2, diagWall.collider.y2]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: 2,
    markerSize: -1,
    markerShadowSize: -1
}))
particleManager.addStaticObject(diagWall)
particleManager.addStaticObject(diagWall2)

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
