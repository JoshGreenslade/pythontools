import {
    verlet
} from '../integrators.js'
import {
    Particle2DSystem,
    Particle2D
} from '../physics.js'

import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition,
} from '../plotting.js'

const backgroundColour = `hsl(180, 0%, 5%)`
document.body.style.backgroundColor = backgroundColour
const margin = 0
const height = screen.height * 0.9
const aspect_ratio = screen.width / screen.height
const width = screen.width * 0.8

var svg = createSVG(".area", width, height)

const gridLayer = new GridLayer(svg, {
    height: height,
    xDomain: [0, 1 * aspect_ratio],
    xRange: [0, screen.width * 0.8],
    yDomain: [0, 1],
    yRange: [screen.height * 0.9, 0],
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
let dt = 0.005
const g = 1e0
const maxA = 999
const maxV = 999

let particleManager = new Particle2DSystem({})

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
            if (particleb.mass < 0.0000001) {
                continue
            }

            let r = dist(particle, particleb)
            if ((r < 0.5) && (r > particleb.radius)) {
                let dy = (particle.y - particleb.y)
                let dx = (particle.x - particleb.x)
                let theta = Math.atan2(dy, dx)
                particle.applyForce(
                    -Math.cos(theta) * g * particle.mass * particleb.mass / r ** 2,
                    -Math.sin(theta) * g * particle.mass * particleb.mass / r ** 2,
                )

            }
        }
        if (particle.xAcc > maxA / particle.mass) {
            particle.xAcc = maxA / particle.mass
        }
        if (particle.xAcc < -maxA / particle.mass) {
            particle.xAcc = -maxA / particle.mass
        }
        if (particle.yAcc > maxA / particle.mass) {
            particle.yAcc = maxA / particle.mass
        }
        if (particle.yAcc < -maxA / particle.mass) {
            particle.yAcc = -maxA / particle.mass
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
        if (particle.x >= 1 * aspect_ratio) {
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

        particle.xVel *= 0.9997
        particle.yVel *= 0.9997

    }
    // self.handleCollisions()
}

let lines = [];

for (let i = 0; i < n_particles; i++) {
    let radius = salpeterIMF(2.35, 0.03 / 100, 30.0 / 100)
    let particle = new Particle2D({
        mass: radius ** 3,
        radius: radius,
        x: Math.random() * 1 * aspect_ratio,
        y: Math.random(),
        // xVel: 0,
        // yVel: 0
        // xVel: (Math.random() - 0.5) / (10000 * radius),
        // yVel: (Math.random() - 0.5) / (10000 * radius),
        canCollide: false
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

d3.interval(() => {
    particleManager.update(dt)
    for (let i = 0; i < particleManager.particles.length; i++) {
        let particle = particleManager.particles[i]
        let line = lines[i]
        line.update({
            data: [[particle.x, particle.y]],
        })
    }
})
