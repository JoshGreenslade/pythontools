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

    static findMean(vectors)
    {
        let sumX = 0;
        let sumY = 0;
        for (let i=0; i < vectors.length; i++)
        {
            let v = vectors[i];
            sumX += v.X;
            sumY += v.Y;
        }

        return new Vector2D(sumX / vectors.length, sumY / vectors.length);
    }
}

export function transform2D(position, angle)
{

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

    static transform(vector, position, angle){
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        let v = new Vector2D(
            ((cos * vector.X) - (sin * vector.Y)) + position.X,
            ((sin * vector.X) + (cos * vector.Y)) + position.Y
        )
        return v
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
