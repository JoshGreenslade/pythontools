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

const backgroundColour = `hsl(180, 0%, 10%)`
document.body.style.backgroundColor = backgroundColour
const margin = 100
const height = 950
const aspect_ratio = 2.0 / 1.0
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

let dt = 0.02
let particleManager = new Particle2DSystem({
    gravity: 0.1
})

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
            integrator: verlet
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
    }
}

let lines = [];
for (let i = 0; i < 200; i++) {
    let particle = new Particle2D({
        x: Math.random(),
        y: Math.random(),
        xVel: 0.2 * (Math.random() - 0.5),
        yVel: 0.2 * (Math.random() - 0.5)
    })
    particleManager.addParticle(particle)
    lines.push(lineLayer.add({
        data: [[particle.x, particle.y]],
        color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
        strokeWidth: 0,
        markerSize: 2 + Math.random() * 15,
        markerShadowSize: 0
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
console.log(lines)
d3.interval(() => {
    particleManager.update(dt)
    let pe = 0
    let ke = 0
    for (let i = 0; i < particleManager.particles.length; i++) {
        let particle = particleManager.particles[i]
        let line = lines[i]
        line.update({ data: [[particle.x, particle.y]] })
        pe += particle.mass * particleManager.gravity * particle.y
        ke += 0.5 * particle.mass * (particle.xVel ** 2 + particle.yVel ** 2)
    }
    console.log((pe + ke).toFixed(3))
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