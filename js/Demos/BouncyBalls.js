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
const margin = 150
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

const lineLayer = new LineLayer(svg, gridLayer)

let particleManager = new Particle2DSystem({})

function dydt(t, state, kwargs) {
    let derivatives = new Array(state.length);
    let N = state.length / 4; // Number of particles

    for (let i = 0; i < N; i++) {
        let baseIndex = i * 4;
        let [x, y, xVel, yVel] = state.slice(baseIndex, baseIndex + 4);

        derivatives[baseIndex] = xVel;
        derivatives[baseIndex + 1] = yVel;
        derivatives[baseIndex + 2] = 0;
        derivatives[baseIndex + 3] = -0.1;
    }
    return derivatives;
}

particleManager.update = (dt) => {
    let self = particleManager
    let extendedState = new Array(self.particles.length * 4)
    for (let i = 0; i < self.particles.length; i++) {
        let baseIndex = i * 4;
        let particle = self.particles[i]
        extendedState[baseIndex] = particle.x
        extendedState[baseIndex + 1] = particle.y
        extendedState[baseIndex + 2] = particle.xVel
        extendedState[baseIndex + 3] = particle.yVel
    }
    let result = verlet({
        dydt: dydt,
        state0: extendedState,
        t_span: [0, dt],
        n_steps: 1
    })
    let newState = result[1].at(-1)
    console.log(result)
    for (let i = 0; i < self.particles.length; i++) {
        let baseIndex = i * 4;
        let particle = self.particles[i]
        particle.x = newState[baseIndex]
        particle.y = newState[baseIndex + 1]
        particle.xVel = newState[baseIndex + 2]
        particle.yVel = newState[baseIndex + 3]
    }
    // self.handleCollisions()

}

let lines = [];
let radius = 0.1
let dt = 0.05
let yvel = 0.05

let particle = new Particle2D({
    mass: 10,
    radius: 0.5,
    x: radius,
    y: 0.5,
    xVel: 0,
    yVel: -yvel,
    canCollide: true
})
particleManager.addParticle(particle)

lines.push(lineLayer.add({
    data: [[particle.x, particle.y]],
    color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
    strokeWidth: -1,
    markerSize: 0.02 * 880,
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
})
