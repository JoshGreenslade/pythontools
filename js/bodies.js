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
        this.verticies = [];
        this.triangles = [];
        this.transformedVerticies = [];
        this.transformUpdateRequired = true;
    }

    move(amount){
        this.position.add(amount)
        this.transformUpdateRequired = true;
    }

    moveTo(position){
        this.position = position
        this.transformUpdateRequired = true;
    }

    rotate(amount){
        this.rotation += amount
        this.transformUpdateRequired = true;
    }

    getTransformedVerticies()
    {
        if (this.transformUpdateRequired)
        {
            for (let i = 0; i < this.verticies.length; i++)
            {
                let v = this.verticies[i]
                this.transformedVerticies[i] = Vector2D.transform(
                    v, 
                    this.position, 
                    this.rotation)
                }
        }
            
        this.transformUpdateRequired = false;
        return this.transformedVerticies
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

export class Box2D extends Body2D {
    constructor(
        width=1,
        height=1,
        position=new Vector2D(0, 0),
        linearVelocity=new Vector2D(0, 0),
        bodyType=Body2DType.Box,
        mass=1,
        isStatic=false)
    {
        super(
            position, 
            bodyType, 
            linearVelocity, 
            mass, 
            isStatic)
        this.width = width
        this.height = height
        this.createVerticies()
        this.createTriangles()
        this.transformedVerticies = Array(4).fill(0.0)

    }

    createVerticies()
    {
        this.verticies = Array(4).fill(new Vector2D(0,0))
        let left = -(this.width / 2.0);
        let right = (this.width / 2.0);
        let bottom =- (this.height / 2.0);
        let top =  + (this.height / 2.0);

        this.verticies[0] = new Vector2D(left, top);
        this.verticies[1] = new Vector2D(right, top);
        this.verticies[2] = new Vector2D(right, bottom);
        this.verticies[3] = new Vector2D(left, bottom);


    }

    createTriangles()
    {
        this.triangles = Array(6)
        this.triangles[0] = 0;
        this.triangles[1] = 1;
        this.triangles[2] = 2;
        this.triangles[3] = 0;
        this.triangles[4] = 2;
        this.triangles[5] = 3;
    }
}

// ====================================
// =========== Collisions =============
// ====================================

function projectVertices(verticies, axis){
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < verticies.length; i++)
    {
        let v = verticies[i];
        let proj = MathV2D.dot(v, axis)

        if (proj < min) { min = proj; }
        if (proj > max) { max = proj; }
    }
    return [min, max]
}

function updateBodyAfterCollision(bodyA, bodyB, normal, depth)
{   
    var tangent = new Vector2D(-1*normal.Y, normal.X)

    var massAFrac = bodyA.mass / (bodyA.mass + bodyB.mass)
    var massBFrac = bodyB.mass / (bodyA.mass + bodyB.mass)

    let moveA = Vector2D.multiply(normal, -1)
    moveA.multiply(depth)
    moveA.multiply(massBFrac)
    let moveB = Vector2D.multiply(normal, depth)
    moveB.multiply(massAFrac)    
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

export function collideCircles(
    bodyA,
    bodyB
) {
    var distance = MathV2D.distance(bodyA.position, bodyB.position)
    var radii = bodyA.radius + bodyB.radius
    if (distance > radii) { return }

    var normal = MathV2D.normalize(Vector2D.subtract(bodyB.position, bodyA.position))
    
    var depth = radii - distance

    updateBodyAfterCollision(bodyA, bodyB, normal, depth)
}

export function colllidePolygons(bodyA, bodyB)
{   

    let normal = new Vector2D(0,0);
    let depth = Number.POSITIVE_INFINITY
    let bodyAVerticies = bodyA.getTransformedVerticies()
    let bodyBVerticies = bodyB.getTransformedVerticies()
    for (let i = 0; i < bodyAVerticies.length; i++)
    {
        let va = bodyAVerticies[i];
        let vb = bodyAVerticies[(i + 1) % bodyAVerticies.length];

        let edge = Vector2D.subtract(vb, va)
        let axis = new Vector2D(-edge.Y, edge.X)
        
        let [minA, maxA] = projectVertices(bodyAVerticies, axis);
        let [minB, maxB] = projectVertices(bodyBVerticies, axis);

        if (minA >= maxB || minB >= maxA)
        {
            return
        }
        
        let axisDepth = Math.min(maxB - minA, maxA - minB);
        if (axisDepth < depth){
            depth = axisDepth
            normal = axis
        }
    }
    for (let i = 0; i < bodyBVerticies.length; i++)
    {
        let va = bodyBVerticies[i];
        let vb = bodyBVerticies[(i + 1) % bodyBVerticies.length];

        let edge = Vector2D.subtract(vb, va)
        let axis = new Vector2D(-edge.Y, edge.X)
        
        let [minA, maxA] = projectVertices(bodyAVerticies, axis);
        let [minB, maxB] = projectVertices(bodyBVerticies, axis);

        if (minA >= maxB || minB >= maxA)
        {
            return
        }
        
        let axisDepth = Math.min(maxB - minA, maxA - minB);
        if (axisDepth < depth){
            depth = axisDepth
            normal = axis
        }
    }

    depth /= (MathV2D.length(normal))
    normal.divide(MathV2D.length(normal))

    let centerA = MathV2D.findMean(bodyAVerticies)
    let centerB = MathV2D.findMean(bodyBVerticies)

    let direction = Vector2D.subtract(centerB, centerA)

    if (MathV2D.dot(direction, normal) < 0)
    {
        normal.multiply(-1)
    }
    updateBodyAfterCollision(bodyA, bodyB, normal, depth)
}