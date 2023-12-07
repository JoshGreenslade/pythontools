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
    // A 2d particle management system.
    // 
    // Example
    // ------
    // 
    // let particleManager = new Particle2DSystem()
    // particleManager.add(new Particle2D())
    // let particle2 = particleManager.add(new Particle2D())
    // particleManager.remove(particle2)
    // particleManager.particles.length === 1
    constructor({ }) {
        this.particles = [];
    }

    addParticle(
        particle    // Particle2D
    ) {
        // Adds a new particle to the particle manager.
        this.particles.push(particle);
        return particle
    }

    removeParticle(
        particle    // Particle2D
    ) {
        // Removes the particle "particle" from the particle manager.
        const index = this.particles.indexOf(particle)
        if (index > -1) {
            this.particles.splice(index, 1)
        }
    }

    handleCollisions() {
        // Handles collisions between particles which have collision.
        // 
        // Assumes 2d solid spheres undergoing fully elastic collision.
        // Final velocities given here:
        // https://en.m.wikipedia.org/wiki/Elastic_collision
        // Overlapping particles are moved apart directly along the 
        // normal vector at the end of the collision.
        let aVelTan,
            bVelTan,
            aVelNorm,
            bVelNorm,
            aFinalVelNorm,
            bFinalVelNorm,
            relVelX,
            relVelY,
            relVelDotNorm,
            overlap,
            particleA,
            particleB,
            dx,
            dy,
            dist2,
            dist,
            norm,
            tan,
            totalRadius,
            moveA,
            moveB
        for (let i = 0; i < this.particles.length; i++) {
            particleA = this.particles[i]

            if (!particleA.canCollide) {
                continue
            }

            for (let j = i + 1; j < this.particles.length; j++) {
                particleB = this.particles[j]

                if (!particleB.canCollide) {
                    continue
                }

                // Ensure the particles are colliding
                dx = (particleB.x - particleA.x)
                dy = (particleB.y - particleA.y)
                dist2 = dx ** 2 + dy ** 2
                if (dist2 >= (particleA.radius + particleB.radius) ** 2) {
                    continue
                }

                // Get the distance, normal vector, and tangent vector 
                // for the collision.
                dist = Math.sqrt(dist2)
                norm = [dx / dist, dy / dist]
                tan = [-norm[1], norm[0]]

                // Don't collide if the particles are moving away from one-another
                relVelX = particleB.xVel - particleA.xVel;
                relVelY = particleB.yVel - particleA.yVel;
                relVelDotNorm = relVelX * norm[0] + relVelY * norm[1];
                if (relVelDotNorm > 0) {
                    continue;
                }

                // Calculate the tangential and normal final velocities
                aVelTan = particleA.xVel * tan[0] + particleA.yVel * tan[1]
                bVelTan = particleB.xVel * tan[0] + particleB.yVel * tan[1]
                aVelNorm = particleA.xVel * norm[0] + particleA.yVel * norm[1]
                bVelNorm = particleB.xVel * norm[0] + particleB.yVel * norm[1]
                aFinalVelNorm = ((particleA.mass - particleB.mass) * aVelNorm + 2 * particleB.mass * bVelNorm) / (particleA.mass + particleB.mass);
                bFinalVelNorm = ((particleB.mass - particleA.mass) * bVelNorm + 2 * particleA.mass * aVelNorm) / (particleA.mass + particleB.mass);

                // Update particle velocities
                particleA.xVel = tan[0] * aVelTan + norm[0] * aFinalVelNorm
                particleA.yVel = tan[1] * aVelTan + norm[1] * aFinalVelNorm
                particleB.xVel = tan[0] * bVelTan + norm[0] * bFinalVelNorm
                particleB.yVel = tan[1] * bVelTan + norm[1] * bFinalVelNorm

                // Handle overlapping particles and move them apart
                // overlap = (particleA.radius + particleB.radius) - dist;
                // if (overlap > 0) {
                //     totalRadius = particleA.radius + particleB.radius;
                //     moveA = (overlap * (particleB.radius / totalRadius));
                //     moveB = (overlap * (particleA.radius / totalRadius));

                //     particleA.x -= moveA * norm[0];
                //     particleA.y -= moveA * norm[1];
                //     particleB.x += moveB * norm[0];
                //     particleB.y += moveB * norm[1];
                // }
            }
        }
    }

    update(
        dt    // Float
    ) {
        // Runs a single update step of time dt.
        // It's expected that the behaviour of this function
        // will be overwritten by the user.
        for (const particle of this.particles) {
            particle.update(dt)
        }
    }
}


export class Particle2D {
    constructor({
        x = 0,              // Float
        y = 0,              // Float
        xVel = 0,           // Float
        yVel = 0,           // Float
        xAcc = 0,           // Float
        yAcc = 0,           // Float
        radius = 1,         // Float
        mass = 1,           // Float
        canCollide = true   // Bool
    }) {
        // A 2D particle object.
        // 
        // Example
        // ------
        // 
        // let particle = new Particle2D({
        // x: 1,
        // y: 0,
        // yVel: 1,
        // mass: 100
        // })
        // particle.applyForce(10, 0)
        // particle.update(1.0)
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

    applyForce(
        fx,         // Float
        fy          // Float
    ) {
        // Applies a force to the particle
        this.xAcc += fx / this.mass;
        this.yAcc += fy / this.mass;
    }

    update({
        dt = 1,                     // Float
        dydt = (t, state) => {      // Function
            return [state[2], state[3], this.xAcc, this.yAcc]
        },
        integrator = euler,         // Function
        n_steps = 10                // int
    }) {
        // Run a single update step.
        // 
        // dt: The timestep
        // dydt: A function which accepts the current particle state
        //      [x, y, xVel, yVel], and returns another array of the
        //      kind [xVel, yVel, xAcc, yAcc]
        // integrator: An integrator function from integrators.js
        // n_steps: The number of steps the integrator should take

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