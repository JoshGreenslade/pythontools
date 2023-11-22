import {
    euler,
    verlet
} from './integrators.js'
import {
    Particle2DSystem,
    Particle2D
} from './physics.js'

import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition,
} from './plotting.js'

const backgroundColour = `hsl(180, 0%, 5%)`
document.body.style.backgroundColor = backgroundColour
const margin = 100
const height = screen.height;
const aspect_ratio = 1.0
const width = height * aspect_ratio
let data = [[0, 0]]

var svg = createSVG(".area", width, height)

const gridLayer = new GridLayer(svg, {
    height: height,
    xDomain: [0, 1],
    xRange: [0, width],
    yDomain: [0, 1],
    yRange: [height, 0],
    margin: margin
})

const lineLayer = new LineLayer(svg, gridLayer)


// ---

//Container for the gradients
var defs = svg.append("defs");

// //Filter for the outside glow
// var filter = defs.append("filter")
//     .attr("id","glow");
// filter.append("feGaussianBlur")
//     .attr("stdDeviation","3.5")
//     .attr("result","coloredBlur");
// var feMerge = filter.append("feMerge");
// feMerge.append("feMergeNode")
//     .attr("in","coloredBlur");
// feMerge.append("feMergeNode")
//     .attr("in","SourceGraphic");

function salpeterIMF(alpha, m_min, m_max) {
    // Generate a random number between 0 and 1
    const rand = Math.random();

    // Inverse transform sampling for power-law distribution
    return Math.pow((Math.pow(m_max, 1 - alpha) - Math.pow(m_min, 1 - alpha)) * rand + Math.pow(m_min, 1 - alpha), 1 / (1 - alpha));
}

let n_particles = 5
let dt = 0.001
const g = 1e-3
const maxA = 0.1
const maxV = 10000
let particleManager = new Particle2DSystem({
    gravity: 0.1
})

function dist(particleA, particleB) {
    return Math.hypot(particleA.x - particleB.x, particleA.y - particleB.y)
}

particleManager.update = (dt) => {
    let self = particleManager
    for (const particle of self.particles) {

        if (particle.xAcc > maxA) {
            particle.xAcc = maxA
        }
        if (particle.xAcc < -maxA) {
            particle.xAcc = -maxA
        }
        if (particle.yAcc > maxA) {
            particle.yAcc = maxA
        }
        if (particle.yAcc < -maxA) {
            particle.yAcc = -maxA
        }
        let dydt = (t, state) => [
            state[2],
            state[3],
            particle.xAcc,
            particle.yAcc]
        particle.update({
            dt: dt,
            dydt: dydt,
            integrator: verlet,
            n_steps: 1
        })

        if (particle.y <= 0.0 + particle.radius) {
            // particle.y = 0.0
            particle.yVel *= -1
        }
        if (particle.x <= 0.0 + particle.radius) {
            // particle.x = 0.0
            particle.xVel *= -1
        }
        if (particle.y >= 1.0 - particle.radius) {
            // particle.y = 1.0
            particle.yVel *= -1
        }
        if (particle.x >= 1.0 - particle.radius) {
            // particle.x = 1.0
            particle.xVel *= -1
        }
        if (particle.xVel > maxV) {
            particle.xVel = maxV
        }
        if (particle.xVel < -maxV) {
            particle.xVel = -maxV
        }
        if (particle.yVel > maxV) {
            particle.yVel = maxV
        }
        if (particle.yVel < -maxV) {
            particle.yVel = -maxV
        }
        particle.xVel *= 1
        particle.yVel *= 1
    }
    self.handleCollisions()
}

let lines = [];
for (let i = 0; i < n_particles; i++) {
    let particle = new Particle2D({
        mass: 1,
        radius: 0.1,
        x: Math.random(),
        y: Math.random(),
        // xVel: 0,
        // yVel: 0
        xVel: 2*Math.random(),
        yVel: 2*Math.random()
    })
    particleManager.addParticle(particle)
    console.log(gridLayer.xScale(particle.radius))
    lines.push(lineLayer.add({
        data: [[particle.x, particle.y]],
        color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
        strokeWidth: -1,
        markerSize: gridLayer.xScale(particle.radius)/(2),
        markerShadowSize: -1
    }))
}
// let x = []
// for (const particle of particleManager.particles) {
//     x.push([particle.x, particle.y])
// }
// let line = lineLayer.add({
//     data: x,
//     color: `hsl(200, 50%, 50%)`,
//     strokeWidth: 0,
//     markerSize: 20
// })

DebugPosition(gridLayer)
d3.interval(() => {
    particleManager.update(dt)
    let pe = 0
    let ke = 0
    for (let i = 0; i < particleManager.particles.length; i++) {
        let particle = particleManager.particles[i]
        let line = lines[i]
        line.update({ data: [[particle.x, particle.y]] })
    }
})
// d3.interval(() => {
//     particleManager.update(dt)
//     let x = []
//     for (let i = 0; i < particleManager.particles.length; i++) {
//         let particle = particleManager.particles[i]
//         x.push([particle.x, particle.y])
//     }
//     line.update({ data: x })
// })