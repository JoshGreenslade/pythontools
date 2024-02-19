// Maths

// A suite of tools and utilities for mathematical
// operations.


// ====================================
// ========= Tips and tricks ==========
// ====================================

// 1) Inline operations are significantly faster than creating new objects.
//      Try to reuse existing objects rather than creating / returning
//      new objects where possible

// 2) Operations are faster with primitives.
//      It may sometimes be worth locally declaring variables and using those
//      values rather than accessing object attributes each time
//      I.e. declare var x = obj.x instead of accessing obj.x each time.

export class MathV2D {

    static length(vector)
    {
        return Math.sqrt(vector.X * vector.X + vector.Y * vector.Y);
    }

    static distance(vectorA, vectorB)
    {
        var dx = vectorA.X - vectorB.X;
        var dy = vectorA.Y - vectorB.Y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static normalize(vector)
    {
        return Vector2D.divide(vector, MathV2D.length(vector));
    }

    static dot(vectorA, vectorB)
    {
        return vectorA.X * vectorB.X + vectorA.Y * vectorB.Y
    }

    static cross(vectorA, vectorB)
    {
        return vectorA.X * vectorB.Y - vectorA.Y * vectorB.X
    }
}

export class Vector2D {
    constructor(x, y) {
        this.X = x; 
        this.Y = y; 
    }

    static add(vectorA, vectorB) {
        return new Vector2D(vectorA.X + vectorB.X, vectorA.Y + vectorB.Y);
    }

    static subtract(vectorA, vectorB) {
        return new Vector2D(vectorA.X - vectorB.X, vectorA.Y - vectorB.Y);
    }

    static multiply(vector, float) {
        return new Vector2D(vector.X * float, vector.Y * float);
    }

    static divide(vector, float) {
        return new Vector2D(vector.X / float, vector.Y / float);
    }

    set(x, y){
        this.X = x;
        this.Y = y;
    }

    add(vector){
        this.X += vector.X;
        this.Y += vector.Y;
    }

    subtract(vector){
        this.X -= vector.X;
        this.Y -= vector.Y;
    }

    multiply(value){
        this.X *= value;
        this.Y *= value;
    }

    divide(value){
        this.X /= value;
        this.Y /= value;
    }
}
