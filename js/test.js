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
const height = screen.height * 0.9;
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

//Filter for the outside glow
var filter = defs.append("filter")
    .attr("id", "glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation", "3.5")
    .attr("result", "coloredBlur");
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

function salpeterIMF(alpha, m_min, m_max) {
    // Generate a random number between 0 and 1
    const rand = Math.random();

    // Inverse transform sampling for power-law distribution
    return Math.pow((Math.pow(m_max, 1 - alpha) - Math.pow(m_min, 1 - alpha)) * rand + Math.pow(m_min, 1 - alpha), 1 / (1 - alpha));
}


let n_particles = 1000
let dt = 0.01
const g = 1e1
const maxA = 999
const maxV = 1
const friction = 1

let particleManager = new Particle2DSystem({
    gravity: 0.1
})

function dist(particleA, particleB) {
    return Math.hypot(particleA.x - particleB.x, particleA.y - particleB.y)
}

particleManager.update = (dt) => {
    let self = particleManager
    for (let i = 0; i < self.particles.length; i++) {
        let particle = self.particles[i]
        for (const particleb of self.particles) {
            if (particle === particleb) {
                continue
            }
            if (particleb.mass < 0.0001 ** 2) {
                continue
            }

            let r = dist(particle, particleb)
            if ((r < 0.2) && (r > 0.05)) {
                let dy = (particle.y - particleb.y)
                let dx = (particle.x - particleb.x)
                let theta = Math.atan2(dy, dx)
                particle.applyForce(
                    -Math.cos(theta) * g * particle.mass * particleb.mass / r ** 2,
                    -Math.sin(theta) * g * particle.mass * particleb.mass / r ** 2,
                )

            }
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
            n_steps: 4
        })

        if (particle.y <= 0.0) {
            // particle.y = 0.0
            particle.yVel *= -1
        }
        if (particle.x <= 0.0) {
            // particle.x = 0.0
            particle.xVel *= -1
        }
        if (particle.y >= 1.0) {
            // particle.y = 1.0
            particle.yVel *= -1
        }
        if (particle.x >= 1.0) {
            // particle.x = 1.0
            particle.xVel *= -1
        }
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

        particle.xVel *= 0.999
        particle.yVel *= 0.999




    }
    self.handleCollisions()
}

let lines = [];
let first = true;
let speed = 1;
for (let i = 0; i < n_particles; i++) {

    let radius = salpeterIMF(2.35, 0.05 / 100, 10.0 / 100)
    let particle = new Particle2D({
        mass: radius ** 3,
        radius: radius,
        x: Math.random(),
        y: Math.random(),
        // xVel: 0,
        // yVel: 0
        xVel: (Math.random() - 0.5) * 0.1,
        yVel: (Math.random() - 0.5) * 0.1,
    })
    particleManager.addParticle(particle)
    lines.push(lineLayer.add({
        data: [[particle.x, particle.y]],
        color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
        strokeWidth: -1,
        markerSize: radius * 880,
        markerShadowSize: -1
    }))
}


DebugPosition(gridLayer)
d3.interval(() => {
    particleManager.update(dt)
    let pe = 0
    let ke = 0
    let p = new Vector([0, 0])
    for (let i = 0; i < particleManager.particles.length; i++) {
        let particle = particleManager.particles[i]
        let speed = 1000 * (particle.xVel ** 2 + particle.yVel ** 2)
        let line = lines[i]
        line.update({
            data: [[particle.x, particle.y]],
        })
        p = p.add(new Vector([particle.xVel, particle.yVel]).multiply(particle.mass))
        ke += 0.5 * particle.mass + (particle.xVel ** 2 + particle.yVel ** 2)
    }
    console.log(p.data[0][0] ** 2 + p.data[1][0] ** 2)
})
