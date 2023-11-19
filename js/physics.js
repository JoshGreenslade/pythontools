// Physics Systems

// Physics system handle the simulation of physical 
// systems. This file contains several implementations
// of basic physics systems.

import {
    euler,
    verlet
} from './integrators.js'

// =============================
// ========= Particles =========
// =============================

export class Particle2DSystem {
    constructor({
        gravity = 9.81,
    }) {
        this.gravity = gravity
        this.particles = [];
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    removeParticle(particle) {
        const index = this.particles.indexOf(particle)
        if (index > -1) {
            this.particles.splice(index, 1)
        }
    }

    update(dt) {
        for (const particle of this.particles) {
            particle.update(dt)
        }
    }
}

export class Particle2D {
    constructor({
        x = 0,
        y = 0,
        xVel = 0,
        yVel = 0,
        xAcc = 0,
        yAcc = 0,
        radius = 1,
        mass = 1
    }) {
        this.x = x
        this.y = y
        this.xVel = xVel
        this.yVel = yVel
        this.xAcc = xAcc
        this.yAcc = yAcc
        this.mass = mass
        this.radius = radius
    }

    applyForce(fx, fy) {
        this.xAcc += fx / this.mass;
        this.yAcc += fy / this.mass;
    }

    update({
        dt = 1,
        dydt = (t, state) => [state[2], state[3], this.xAcc, this.yAcc],
        integrator = euler,
        n_steps = 10
    }) {
        let result = integrator({
            dydt: dydt,
            state0: [this.x, this.y, this.xVel, this.yVel],
            t_span: [0, dt],
            n_steps: n_steps
        })
        let state = result[1].at(-1)
        this.x = state[0]
        this.y = state[1]
        this.xVel = state[2]
        this.yVel = state[3]
        this.yAcc = 0
        this.xAcc = 0
    }
}