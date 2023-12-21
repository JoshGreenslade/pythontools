// Physics Systems

// Physics system handle the simulation of physical 
// systems. This file contains several implementations
// of basic physics systems.

import {
    verlet
} from './integrators.js'

import {
    closestPointOnLine,
    checkLinesCollide
} from './maths.js'

// ====================================
// ========== Partice System ==========
// ====================================


export class ParticleSystem {
    constructor(
        integrator = verlet,
        timestep = 0.05
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
                    this._collideDynamicObjects(objectA, objectB)
                }
            }

            for (let k = 0; k < this.staticEntities.length; k++) {
                let objectC = this.staticEntities[k]
                if (!objectC.collider) {
                    continue
                }
                if (objectA.collider.collideWith(objectC.collider)) {
                    this._collideStaticObjects(objectA, objectC)
                }
            }
        }
    }

    _collideDynamicObjects(objectA, objectB) {
        // Get the distance, normal vector, and tangent vector 
        // for the collision.
        let dx = (objectB.x - objectA.x)
        let dy = (objectB.y - objectA.y)
        let dist2 = dx ** 2 + dy ** 2
        let dist = Math.sqrt(dist2)
        let norm = [dx / dist, dy / dist]
        let tan = [-norm[1], norm[0]]

        // Don't collide if the particles are moving away from one-another
        let relVelX = objectB.xVel - objectA.xVel;
        let relVelY = objectB.yVel - objectA.yVel;
        let relVelDotNorm = relVelX * norm[0] + relVelY * norm[1];
        if (relVelDotNorm > 0) {
            return;
        }
        // Calculate the tangential and normal final velocities
        let aVelTan = objectA.xVel * tan[0] + objectA.yVel * tan[1]
        let bVelTan = objectB.xVel * tan[0] + objectB.yVel * tan[1]
        let aVelNorm = objectA.xVel * norm[0] + objectA.yVel * norm[1]
        let bVelNorm = objectB.xVel * norm[0] + objectB.yVel * norm[1]
        let aFinalVelNorm = ((objectA.mass - objectB.mass) * aVelNorm + 2 * objectB.mass * bVelNorm) / (objectA.mass + objectB.mass);
        let bFinalVelNorm = ((objectB.mass - objectA.mass) * bVelNorm + 2 * objectA.mass * aVelNorm) / (objectA.mass + objectB.mass);

        // Update particle velocities
        objectA.xVel = tan[0] * aVelTan + norm[0] * aFinalVelNorm
        objectA.yVel = tan[1] * aVelTan + norm[1] * aFinalVelNorm
        objectB.xVel = tan[0] * bVelTan + norm[0] * bFinalVelNorm
        objectB.yVel = tan[1] * bVelTan + norm[1] * bFinalVelNorm
    }

    _collideStaticObjects(objectA, objectB) {
        // Get the distance, normal vector, and tangent vector 
        // for the collision.
        let ax, ay, bx, by

        if (objectA.collider instanceof CircleCollider) {
            ax = objectA.x
            ay = objectA.y
        }
        if (objectB.collider instanceof CircleCollider) {
            bx = objectB.x
            by = objectB.y
        }
        if (objectB.collider instanceof LineCollider) {
            [bx, by] = closestPointOnLine(objectB.x, objectB.y,
                objectB.collider.x2, objectB.collider.y2,
                ax, ay)
        }

        let dx = (bx - ax)
        let dy = (by - ay)
        let dist2 = dx ** 2 + dy ** 2
        let dist = Math.sqrt(dist2)
        let norm = [dx / dist, dy / dist]
        let tan = [-norm[1], norm[0]]

        // Don't collide if the particles are moving away from one-another
        let relVelX = - objectA.xVel;
        let relVelY = - objectA.yVel;
        let relVelDotNorm = relVelX * norm[0] + relVelY * norm[1];
        if (relVelDotNorm > 0) {
            return;
        }
        // Calculate the tangential and normal final velocities
        let aVelTan = objectA.xVel * tan[0] + objectA.yVel * tan[1]
        let aVelNorm = objectA.xVel * norm[0] + objectA.yVel * norm[1]
        let aFinalVelNorm = -aVelNorm

        // Update particle velocities
        objectA.xVel = tan[0] * aVelTan + norm[0] * aFinalVelNorm
        objectA.yVel = tan[1] * aVelTan + norm[1] * aFinalVelNorm
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
            otherAABB.parent.y + otherAABB.offsetY) > Math.min(this.parent.y + this.offsetY + this.height,
                otherAABB.parent.y + otherAABB.height + otherAABB.offsetY)) {
            return false;
        }

        return true
    }

    collideWithCircle(otherCircleCollider) {
        let xl = this.parent.x + this.offsetX
        let xr = this.parent.x + this.offsetX + this.width
        let yb = this.parent.y + this.offsetY
        let yt = this.parent.y + this.offsetY + this.height

        // Broad phase
        if (otherCircleCollider.parent.y - otherCircleCollider.radius > yt ||
            otherCircleCollider.parent.y + otherCircleCollider.radius < yb ||
            otherCircleCollider.parent.x - otherCircleCollider.radius > xr ||
            otherCircleCollider.parent.x + otherCircleCollider.radius < xl) {
            return false
        }

        // Narrow Phase
        let [cx, cy] = closestPointOnLine(xr, yb, xr, yt,
            otherCircleCollider.parent.x,
            otherCircleCollider.parent.y)
        let dx2 = (cx - otherCircleCollider.parent.x) ** 2
        let dy2 = (cy - otherCircleCollider.parent.y) ** 2
        if (dx2 + dy2 < otherCircleCollider.radius ** 2) {
            return true
        }

        [cx, cy] = closestPointOnLine(xl, yt, xr, yt,
            otherCircleCollider.parent.x,
            otherCircleCollider.parent.y)
        dx2 = (cx - otherCircleCollider.parent.x) ** 2
        dy2 = (cy - otherCircleCollider.parent.y) ** 2
        if (dx2 + dy2 < otherCircleCollider.radius ** 2) {
            return true
        }

        [cx, cy] = closestPointOnLine(xl, yb, xl, yt,
            otherCircleCollider.parent.x,
            otherCircleCollider.parent.y)
        dx2 = (cx - otherCircleCollider.parent.x) ** 2
        dy2 = (cy - otherCircleCollider.parent.y) ** 2
        if (dx2 + dy2 < otherCircleCollider.radius ** 2) {
            return true
        }

        [cx, cy] = closestPointOnLine(xl, yb, xr, yb,
            otherCircleCollider.parent.x,
            otherCircleCollider.parent.y)
        dx2 = (cx - otherCircleCollider.parent.x) ** 2
        dy2 = (cy - otherCircleCollider.parent.y) ** 2
        if (dx2 + dy2 < otherCircleCollider.radius ** 2) {
            return true
        }

        return false
    }

    collideWithLine(otherLineCollider) {
        throw new Error("Not implemented");
    }
}

export class CircleCollider extends Collider {
    constructor({
        radius,
        offsetX = 0,
        offsetY = 0
    }) {
        super()
        this.radius = radius
        this.offsetX = offsetX
        this.offsetY = offsetY
        this.parent = null
    }

    collideWith(otherCollider) {
        return otherCollider.collideWithCircle(this);
    }

    collideWithCircle(otherCircleCollider) {
        let dx = (this.parent.x - otherCircleCollider.parent.x)
        let dy = (this.parent.y - otherCircleCollider.parent.y)
        let dist2 = dx ** 2 + dy ** 2
        if (dist2 >= (this.radius + otherCircleCollider.radius) ** 2) {
            return false
        }
        return true
    }

    collideWithLine(otherLineCollider) {
        let [cx, cy] = closestPointOnLine(otherLineCollider.parent.x,
            otherLineCollider.parent.y,
            otherLineCollider.x2,
            otherLineCollider.y2,
            this.parent.x,
            this.parent.y
        )
        let dx2 = (cx - this.parent.x) ** 2
        let dy2 = (cy - this.parent.y) ** 2
        if (dx2 + dy2 <= this.radius ** 2) {
            return true
        }
        return false
    }

    collideWithAABB(otherAABB) {
        return otherAABB.collideWithCircle(this)
    }

}

export class LineCollider extends Collider {
    constructor({
        x2,
        y2,
        offsetX = 0,
        offsetY = 0
    }) {
        super()
        this.x2 = x2
        this.y2 = y2
        this.offsetX = offsetX
        this.offsetY = offsetY
        this.parent = null
    }

    collideWith(otherCollider) {
        return otherCollider.collideWithLine(this);
    }

    collideWithLine(otherLineCollider) {
        if (checkLinesCollide(this.parent.x,
            this.parent.y,
            this.x2,
            this.y2,
            otherLineCollider.parent.x,
            otherLineCollider.parent.y,
            otherLineCollider.x2,
            otherLineCollider.y2)) {
            return true
        }
        return false
    }

    collideWithCircle(otherCircleCollider) {
        return otherCircleCollider.collideWithLine(this)
    }

    collideWithAABB(otherAABB) {
        return otherAABB.collideWithLine(this)
    }
}

// =============================
// ========== Entities =========
// =============================


export class Entity2D {
    constructor({
        x = 0,
        y = 0,
        collider = null             // Collider
    }) {
        this.x = x
        this.y = y
        this.collider = collider
        if (this.collider) {
            this.collider.parent = this
        }
    }
}

export class Particle2D extends Entity2D {
    constructor({
        x = 0,
        y = 0,
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
        super({
            x: x,
            y: y,
            collider: collider
        })
        this.xVel = xVel
        this.yVel = yVel
        this.xAcc = xAcc
        this.yAcc = yAcc
        this.mass = mass
        this.radius = radius

        // 
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