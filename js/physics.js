// Physics Systems

// Physics system handle the simulation of physical 
// systems. This file contains several implementations
// of basic physics systems.

import {
    euler,
    verlet
} from './integrators.js'

import {
    Vector,
    Matrix
} from './maths.js'

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

    handleCollisions() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i+1; j < this.particles.length; j++) {

                let particleA = this.particles[i]
                let particleB = this.particles[j]
                let dx = (particleB.x - particleA.x)
                let dy = (particleB.y - particleA.y)
                let dist2 = dx**2 + dy**2

                if (dist2 >= (particleA.radius + particleB.radius)**2){
                    continue
                }

                // console.log(`P Before: ${
                //     particleA.mass * Math.hypot(particleA.xVel, particleA.yVel) +
                //     particleB.mass * Math.hypot(particleB.xVel, particleB.yVel)
                //     }`)

                const dist = Math.sqrt(dist2)
                const norm = [dx/dist, dy/dist]
                const tan = [-norm[1], norm[0]]

                let relVelX = particleB.xVel - particleA.xVel;
                let relVelY = particleB.yVel - particleA.yVel;

                let relVelDotNorm = relVelX * norm[0] + relVelY * norm[1];

                if (relVelDotNorm > 0) {
                    continue;
}
                
                const aVelTan = particleA.xVel * tan[0] + particleA.yVel * tan[1]
                const bVelTan = particleB.xVel * tan[0] + particleB.yVel * tan[1]
                let aVelNorm = particleA.xVel * norm[0] + particleA.yVel * norm[1]
                let bVelNorm = particleB.xVel * norm[0] + particleB.yVel * norm[1]

                // let aFinalVelNorm = (2*com) - aVelNorm
                // let bFinalVelNorm = (2*com) - bVelNorm
                let aFinalVelNorm = ((particleA.mass - particleB.mass) * aVelNorm + 2 * particleB.mass * bVelNorm) / (particleA.mass + particleB.mass);
                let bFinalVelNorm = ((particleB.mass - particleA.mass) * bVelNorm + 2 * particleA.mass * aVelNorm) / (particleA.mass + particleB.mass);


                particleA.xVel = tan[0] * aVelTan + norm[0] * aFinalVelNorm
                particleA.yVel = tan[1] * aVelTan + norm[1] * aFinalVelNorm
                particleB.xVel = tan[0] * bVelTan + norm[0] * bFinalVelNorm
                particleB.yVel = tan[1] * bVelTan + norm[1] * bFinalVelNorm

                let overlap = (particleA.radius + particleB.radius) - dist;
                if (overlap > 0) {
                    // Calculate the proportion of the overlap to move each particle
                    let totalRadius = particleA.radius + particleB.radius;
                    let moveA = (overlap * (particleB.radius / totalRadius));
                    let moveB = (overlap * (particleA.radius / totalRadius));

                    // Adjust positions to prevent overlap in the next frame
                    particleA.x -= moveA * norm[0];
                    particleA.y -= moveA * norm[1];
                    particleB.x += moveB * norm[0];
                    particleB.y += moveB * norm[1];
                }
                // console.log(`P After: ${
                //     particleA.mass * Math.hypot(particleA.xVel, particleA.yVel) +
                //     particleB.mass * Math.hypot(particleB.xVel, particleB.yVel)
                //     }`)

                
            }
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
        mass = 1,
        canCollide = true
    }) {
        this.x = x
        this.y = y
        this.xVel = xVel
        this.yVel = yVel
        this.xAcc = xAcc
        this.yAcc = yAcc
        this.mass = mass
        this.radius = radius
        this.canCollide = canCollide
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