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

let particleManager = new Particle2DSystem({})
let g = 1e-2

function dist(particleA, particleB) {
    return Math.hypot(particleA.x - particleB.x, particleA.y - particleB.y)
}

function gravitationalForce(particleA, particleB) {
    // Calculate the gravitational force between two particles
    // Return the force as an array [fx, fy]
    let dy = (particleB[1] - particleA[1])
    let dx = (particleB[0] - particleA[0])
    let r2 = dx**2 + dy**2

    let theta = Math.atan2(dy, dx)
    return [
        Math.cos(theta) * g * 1 * 1 / r2,
        Math.sin(theta) * g * 1 * 1 / r2
    ]
}

function dydt(t, extendedState) {
    // extendedState is an array containing the states of all particles
    // [x1, y1, xVel1, yVel1, x2, y2, xVel2, yVel2, ..., xN, yN, xVelN, yVelN]

    let derivatives = new Array(extendedState.length);
    let N = extendedState.length / 4; // Number of particles

    for (let i = 0; i < N; i++) {
        let baseIndex = i * 4;
        let [x, y, xVel, yVel] = extendedState.slice(baseIndex, baseIndex + 4);

        let fxTotal = 0, fyTotal = 0;


        // Calculate gravitational forces with all other particles
        for (let j = 0; j < N; j++) {
            if (i !== j) {
                let otherBaseIndex = j * 4;
                let [otherX, otherY] = extendedState.slice(otherBaseIndex, otherBaseIndex + 2);
                let [fx, fy] = gravitationalForce([x, y], [otherX, otherY]);
                fxTotal += fx;
                fyTotal += fy;
            }
        }
        let massOfParticleI = 1

        let xAcc = fxTotal / massOfParticleI; // You need to know the mass of each particle
        let yAcc = fyTotal / massOfParticleI;

        derivatives[baseIndex] = xVel;
        derivatives[baseIndex + 1] = yVel;
        derivatives[baseIndex + 2] = xAcc;
        derivatives[baseIndex + 3] = yAcc;
    }

    return derivatives;
}

particleManager.update = (dt) => {
    let self = particleManager
    let state = new Array(self.particles.length * 4)
    for (let i = 0; i < self.particles.length; i++){
        let baseIndex = i * 4;
        let particle = self.particles[i]
        state[baseIndex] = particle.x
        state[baseIndex+1] = particle.y
        state[baseIndex+2] = particle.xVel
        state[baseIndex+3] = particle.yVel
    }
    let result = verlet({
        dydt: dydt,
        state0: state,
        t_span: [0, dt],
        n_steps: 10
    })
    let newState = result[1].at(-1)
    for (let i = 0; i < self.particles.length; i++){
        let baseIndex = i * 4;
        let particle = self.particles[i]
        particle.x = newState[baseIndex] 
        particle.y = newState[baseIndex+1] 
        particle.xVel = newState[baseIndex+2] 
        particle.yVel = newState[baseIndex+3] 
    }
}

let lines = [];
let radius = 0.1
let dt = 0.05
let yvel = 0.079

let particle = new Particle2D({
    mass: 1,
    radius: radius,
    x: radius,
    y: 0.5,
    xVel: 0,
    yVel: yvel
})
particleManager.addParticle(particle)

lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: -1,
    markerSize: radius * 880,
    markerShadowSize: -1
}))
particle = new Particle2D({
    mass: 1,
    radius: radius,
    x: 1-radius,
    y: 0.5,
    xVel: 0,
    yVel: -yvel
})
particleManager.addParticle(particle)

lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: -1,
    markerSize: radius * 880,
    markerShadowSize: -1
}))

lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: 1,
    markerSize: 0,
    markerShadowSize: -1
}))

lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: 1,
    markerSize: 0,
    markerShadowSize: -1
}))



d3.interval(() => {
    particleManager.update(dt)
    for (let i = 0; i < particleManager.particles.length; i++) {
        let particle = particleManager.particles[i]
        let line = lines[i]
        line.update({
            data: [[particle.x, particle.y]],
        })
    }
    let newData = lines[2].data
    newData.push([particleManager.particles[1].x, particleManager.particles[1].y])
    lines[2].update({
        data: newData
    })
    newData = lines[3].data
    newData.push([particleManager.particles[0].x, particleManager.particles[0].y])
    lines[3].update({
        data: newData
    })
}, 1)
