// Bodies

import { Vector2D } from "./mathsV2.js"

// Objects which deal with the construction 
// and tracking of simulation objects.


// ====================================
// ========= Tips and tricks ==========
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