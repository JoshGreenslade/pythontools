import {
    verlet
} from './integrators.js'
import {
    ParticleSystem,
    Particle2D,
    AxisAlignedBoundaryBoxCollider
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
    xDomain: [0, 1],
    xRange: [0, width],
    yDomain: [0, 1],
    yRange: [height, 0],
    margin: margin
})

gridLayer.setYAxesCenter(0)
gridLayer.setXAxesCenter(0)

const lineLayer = new LineLayer(svg, gridLayer)
let dt = 0.005

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
        derivatives[baseIndex + 3] = -0.5;
    }
    return derivatives;
}

let lines = [];
let radius = 0.01
let particle = new Particle2D({
    mass: 1,
    radius: radius,
    x: Math.random(),
    y: 0.9,
    xVel: 0.1,
    yVel: 0,
    collider: new AxisAlignedBoundaryBoxCollider({
        offsetX: -radius,             // Attaching to a dynamic object assumes relative position
        offsetY: -0.9,
        width: 2 * radius,
        height: 1
    })
})
particleManager.addDynamicObject(particle)
lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: -1,
    markerSize: Math.abs(gridLayer.yScale(0) - gridLayer.yScale(particle.radius)),
    // markerSize: 10,
    markerShadowSize: -1
}))


for (let i = 0; i < 500; i++) {

    let particle2 = new Particle2D({
        mass: 1,
        radius: radius,
        x: Math.random(),
        y: Math.random(),
        xVel: Math.random() - 0.5,
        yVel: Math.random() - 0.5
    })
    particleManager.addDynamicObject(particle2)
    lines.push(lineLayer.add({
        data: [[particle2.x, particle2.y]],
        color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
        strokeWidth: -1,
        markerSize: Math.abs(gridLayer.yScale(0) - gridLayer.yScale(particle2.radius)),
        // markerSize: 10,
        markerShadowSize: -1
    }))

}


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
    // lines[2].update({
    //     data: [[particle2.x + particle2.collider.offsetX, 0.5], [particle2.x + particle2.collider.width + particle2.collider.offsetX, 0.5]],
    // })
    lines[2].update({
        data: [[particle.x + particle.collider.offsetX, 0.5], [particle.x + particle.collider.width + particle.collider.offsetX, 0.5]],
    })
})
