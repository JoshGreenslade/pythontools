import {
    euler,
    verlet
} from './integrators.js'
import { Vector } from './maths.js'
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
const margin = 50
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

let n_particles = 500
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
    }
    self.handleCollisions()
}

let lines = [];
let first = true;
let speed = 1;
for (let i = 0; i < n_particles; i++) {
    if (first) {
        speed = 10
        first = false;
    }
    else {
        speed = 0 
    }
    let radius = 0.005
    let particle = new Particle2D({
        mass: radius**2,
        radius: radius,
        x: Math.random(),
        y: Math.random(),
        // xVel: 0,
        // yVel: 0
        xVel: speed,
        yVel: speed
    })
    particleManager.addParticle(particle)
    lines.push(lineLayer.add({
        data: [[particle.x, particle.y]],
        color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
        strokeWidth: -1,
        markerSize: radius*880,
        markerShadowSize: -1
    }))
}


DebugPosition(gridLayer)
d3.interval(() => {
    particleManager.update(dt)
    let pe = 0
    let ke = 0
    let p = 0
    for (let i = 0; i < particleManager.particles.length; i++) {
        let particle = particleManager.particles[i]
        let speed = 1000*(particle.xVel**2 + particle.yVel**2)
        let line = lines[i]
        line.update({ data: [[particle.x, particle.y]],
            color: `hsl(270, ${speed}%, 50%)` })
        p += Math.hypot(particle.xVel, particle.yVel) * particle.mass
        ke += 0.5 * particle.mass + (particle.xVel**2 + particle.yVel**2)
    }
    console.log(p.toFixed(5))
})
