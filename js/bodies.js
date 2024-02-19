// Bodies

import { MathV2D, Vector2D } from "./mathsV2.js"

// Objects which deal with the construction 
// and tracking of simulation objects.


// ====================================
// ========= Tips and tricks ==========
// ====================================

// ====================================
// ============= Bodies ===============
// ====================================

const Body2DType = {
    Circle: "circle",
    Box: "box",
    Polygon: "polygon"
}

export class Body2D {
    constructor(position=new Vector2D(0, 0),
                bodyType,
                linearVelocity=new Vector2D(0, 0),
                mass=1,
                isStatic=false
                ) {

        this.position = position
        this.linearVelocity = linearVelocity
        this.mass = mass
        this.bodyType = bodyType
        this.isStatic = isStatic
        this.rotation = 0.0;
        this.rotationalVelocity = 0.0;
    }

    move(amount){
        this.position.add(amount)
    }

    moveTo(position){
        this.position = position
    }

    rotate(amount){
        this.rotation += amount
    }
}

export class Circle2D extends Body2D {
    constructor(
        position=new Vector2D(0, 0),
        radius=1,
        bodyType=Body2DType.Circle,
        linearVelocity=new Vector2D(0, 0),
        mass=1,
        isStatic=false)
    {
        super(
            position, 
            bodyType, 
            linearVelocity, 
            mass, 
            isStatic)
        this.radius = radius
    }

}

// ====================================
// =========== Collisions =============
// ====================================

export function collideCircles(
    bodyA,
    bodyB
) {
    var distance = MathV2D.distance(bodyA.position, bodyB.position)
    var radii = bodyA.radius + bodyB.radius
    if (distance > radii) { return }

    var normal = MathV2D.normalize(Vector2D.subtract(bodyB.position, bodyA.position))
    var tangent = new Vector2D(-1*normal.Y, normal.X)
    var depth = radii - distance
    var massAFrac = bodyA.mass / (bodyA.mass + bodyB.mass)
    var massBFrac = bodyB.mass / (bodyA.mass + bodyB.mass)
    let moveA = Vector2D.multiply(normal, -1)
    moveA.multiply(depth)
    moveA.multiply(massBFrac)
    let moveB = Vector2D.multiply(normal, depth)
    moveB.multiply(massAFrac)
    // bodyA.move(Vector2D.multiply(normal, -1).multiply(depth).divide(2.0))
    // bodyB.move(Vector2D.multiply(normal, depth).divide(2.0))
    
    bodyA.move(moveA)
    bodyB.move(moveB)

    // Calculate the tangential and normal final velocities
    let aVelTan = MathV2D.dot(bodyA.linearVelocity, tangent)
    let bVelTan = MathV2D.dot(bodyB.linearVelocity, tangent)
    let aVelNorm = MathV2D.dot(bodyA.linearVelocity, normal)
    let bVelNorm = MathV2D.dot(bodyB.linearVelocity, normal)
    let aFinalVelNorm = ((bodyA.mass - bodyB.mass) * aVelNorm + 2 * bodyB.mass * bVelNorm) / (bodyA.mass + bodyB.mass);
    let bFinalVelNorm = ((bodyB.mass - bodyA.mass) * bVelNorm + 2 * bodyA.mass * aVelNorm) / (bodyA.mass + bodyB.mass);


    bodyA.linearVelocity.set(tangent.X * aVelTan + normal.X * aFinalVelNorm,
                             tangent.Y * aVelTan + normal.Y * aFinalVelNorm)

    bodyB.linearVelocity.set(tangent.X * bVelTan + normal.X * bFinalVelNorm,
                             tangent.Y * bVelTan + normal.Y * bFinalVelNorm)
}
