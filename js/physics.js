// Physics Systems

// Physics system handle the simulation of physical 
// systems. This file contains several implementations
// of basic physics systems.

import {
    verlet
} from './integrators.js'

// ====================================
// ========== Partice System ==========
// ====================================


export class ParticleSystem {
    constructor(
        integrator = verlet,
        timestep = 0.005
    ) {
        this.dynamicEntities = []
        this.state = []
        this.staticEntities = []
        this.integrator = integrator
        this.timestep = timestep
    }

    addDynamicObject(entity) {
        this.dynamicEntities.push(entity)
    }

    addStaticObject(entity) {
        this.staticEntities.push(entity)
    }

    update(dydt) {
        // The ParticleSystem expects the state to be in the form
        // [p1.x, p1.y, p1.vx, p1.vy, p2.x, p2.y....pn.vy]
        // Where p1 is particle 1, p2 is particle 2, and x, y, vx and vy
        // are the x, y positions and x, and y velocities respectively.
        // 
        // It also expects a function dydt of the form
        // [d(p1.x)/dt, d(p1.y)/dt, d(p1.vx)/dt, d(p1.vy)/dt...]
        // i.e. the derivities of the state vector.
        // 
        // It will then update the positions and velocities of all particles,
        // followed by checking for collisions with all static and dynamic
        // colliders

        // Handle updating particle positions and velocities
        this.handleDynamicUpdate(dydt)

        // Handle collisions
        this.handleCollisions()
    }

    handleDynamicUpdate(dydt) {
        let result = this.integrator({
            dydt: dydt,
            state0: this.getState(),
            t_span: [0, this.timestep],
            n_steps: 1
        })[1].at(-1)

        for (let i = 0; i < this.dynamicEntities.length; i++) {
            // Handle position & velocity updates
            let baseIndex = i * 4;
            let particle = this.dynamicEntities[i]
            particle.x = result[baseIndex]
            particle.y = result[baseIndex + 1]
            particle.xVel = result[baseIndex + 2]
            particle.yVel = result[baseIndex + 3]
        }
    }

    handleCollisions() {
        for (let i = 0; i < this.dynamicEntities.length; i++) {
            let objectA = this.dynamicEntities[i]
            if (!objectA.collider) {
                continue
            }
            // Check against other dynamic objects
            for (let j = i + 1; j < this.dynamicEntities.length; j++) {
                let objectB = this.dynamicEntities[j]
                if (!objectB.collider) {
                    continue
                }
                if (objectA.collider.collideWith(objectB.collider)) {
                    console.log("Dynamic Colliding!")
                }
            }

            for (let k = 0; k < this.staticEntities.length; k++) {
                let objectC = this.staticEntities[k]
                if (!objectC.collider) {
                    continue
                }
                if (objectA.collider.collideWith(objectC.collider)) {
                    console.log("Static Colliding!")
                }
            }
        }
    }

    updateState() {
        this.state = new Array(this.dynamicEntities.length * 4)
        for (let i = 0; i < this.dynamicEntities.length; i++) {
            let baseIndex = i * 4;
            let particle = this.dynamicEntities[i]
            this.state[baseIndex] = particle.x
            this.state[baseIndex + 1] = particle.y
            this.state[baseIndex + 2] = particle.xVel
            this.state[baseIndex + 3] = particle.yVel
        }
    }

    getState() {
        // Gets the state object for all dynamicEntities in the system
        this.updateState()
        return this.state
    }
}

// ========== Colliders ==========

class Collider {
    collideWith(otherCollider) {
        throw new Error("Not implemented");
    }
}

export class NonCollider extends Collider {
    // NonCollider doesn't collide
    collideWith(otherCollider) {
        return false
    }
}

export class AxisAlignedBoundaryBoxCollider extends Collider {
    constructor({
        width,
        height,
        offsetX = 0,
        offsetY = 0,
    }) {
        super();
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.parent = null
    }

    collideWith(otherCollider) {
        return otherCollider.collideWithAABB(this);
    }

    collideWithAABB(otherAABB) {
        // Check for x overlap
        if (Math.max(this.parent.x + this.offsetX,
            otherAABB.parent.x + otherAABB.offsetX) > Math.min(this.parent.x + this.offsetX + this.width,
                otherAABB.parent.x + otherAABB.width + otherAABB.offsetX)) {
            return false;
        }

        // Check for y overlap
        if (Math.max(this.parent.y + this.offsetY,
            otherAABB.parent.y + otherAABB.offsetY) > Math.min(this.parent.y + this.offsetY + this.width,
                otherAABB.parent.y + otherAABB.width + otherAABB.offsetY)) {
            return false;
        }

        return true
    }
}

// =============================
// ========== Entities =========
// =============================


//     handleCollisions() {
//         // Handles collisions between particles which have collision.
//         // 
//         // Assumes 2d solid spheres undergoing fully elastic collision.
//         // Final velocities given here:
//         // https://en.m.wikipedia.org/wiki/Elastic_collision
//         // Overlapping particles are moved apart directly along the 
//         // normal vector at the end of the collision.
//         let aVelTan,
//             bVelTan,
//             aVelNorm,
//             bVelNorm,
//             aFinalVelNorm,
//             bFinalVelNorm,
//             relVelX,
//             relVelY,
//             relVelDotNorm,
//             overlap,
//             particleA,
//             particleB,
//             dx,
//             dy,
//             dist2,
//             dist,
//             norm,
//             tan,
//             totalRadius,
//             moveA,
//             moveB
//         for (let i = 0; i < this.particles.length; i++) {
//             particleA = this.particles[i]

//             if (!particleA.canCollide) {
//                 continue
//             }

//             for (let j = i + 1; j < this.particles.length; j++) {
//                 particleB = this.particles[j]

//                 if (!particleB.canCollide) {
//                     continue
//                 }

//                 // Ensure the particles are colliding
//                 dx = (particleB.x - particleA.x)
//                 dy = (particleB.y - particleA.y)
//                 dist2 = dx ** 2 + dy ** 2
//                 if (dist2 >= (particleA.radius + particleB.radius) ** 2) {
//                     continue
//                 }

//                 // Get the distance, normal vector, and tangent vector 
//                 // for the collision.
//                 dist = Math.sqrt(dist2)
//                 norm = [dx / dist, dy / dist]
//                 tan = [-norm[1], norm[0]]

//                 // Don't collide if the particles are moving away from one-another
//                 relVelX = particleB.xVel - particleA.xVel;
//                 relVelY = particleB.yVel - particleA.yVel;
//                 relVelDotNorm = relVelX * norm[0] + relVelY * norm[1];
//                 if (relVelDotNorm > 0) {
//                     continue;
//                 }

//                 // Calculate the tangential and normal final velocities
//                 aVelTan = particleA.xVel * tan[0] + particleA.yVel * tan[1]
//                 bVelTan = particleB.xVel * tan[0] + particleB.yVel * tan[1]
//                 aVelNorm = particleA.xVel * norm[0] + particleA.yVel * norm[1]
//                 bVelNorm = particleB.xVel * norm[0] + particleB.yVel * norm[1]
//                 aFinalVelNorm = ((particleA.mass - particleB.mass) * aVelNorm + 2 * particleB.mass * bVelNorm) / (particleA.mass + particleB.mass);
//                 bFinalVelNorm = ((particleB.mass - particleA.mass) * bVelNorm + 2 * particleA.mass * aVelNorm) / (particleA.mass + particleB.mass);

//                 // Update particle velocities
//                 particleA.xVel = tan[0] * aVelTan + norm[0] * aFinalVelNorm
//                 particleA.yVel = tan[1] * aVelTan + norm[1] * aFinalVelNorm
//                 particleB.xVel = tan[0] * bVelTan + norm[0] * bFinalVelNorm
//                 particleB.yVel = tan[1] * bVelTan + norm[1] * bFinalVelNorm

//                 // Handle overlapping particles and move them apart
//                 // overlap = (particleA.radius + particleB.radius) - dist;
//                 // if (overlap > 0) {
//                 //     totalRadius = particleA.radius + particleB.radius;
//                 //     moveA = (overlap * (particleB.radius / totalRadius));
//                 //     moveB = (overlap * (particleA.radius / totalRadius));

//                 //     particleA.x -= moveA * norm[0];
//                 //     particleA.y -= moveA * norm[1];
//                 //     particleB.x += moveB * norm[0];
//                 //     particleB.y += moveB * norm[1];
//                 // }
//             }
//         }
//     }

export class Entity2D {

}

export class Particle2D {
    constructor({
        x = 0,                      // Float
        y = 0,                      // Float
        xVel = 0,                   // Float
        yVel = 0,                   // Float
        xAcc = 0,                   // Float
        yAcc = 0,                   // Float
        radius = 1,                 // Float
        mass = 1,                   // Float
        collider = null             // Collider
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

        // 
        this.collider = collider
        if (this.collider) {
            this.collider.parent = this
        }
    }

    applyForce(
        fx,         // Float
        fy          // Float
    ) {
        // Applies a force to the particle
        this.xAcc += fx / this.mass;
        this.yAcc += fy / this.mass;
    }
}