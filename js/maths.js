// Maths

// A suite of tools and utilities for mathematical
// operations.

// =====================================
// ========== Collision Tools ==========
// =====================================

export function checkLinesCollide(x1, y1, x2, y2, x3, y3, x4, y4) {
    let a1 = y2 - y1
    let b1 = x2 - x1
    let c1 = a1 * x1 + b1 * y1
    let a2 = y4 - y3
    let b2 = x4 - x3
    let c2 = a2 * x3 + b2 * y3
    let det = a1 * b2 - a2 * b1
    if (det === 0) {
        return null
    }
    let x = (b2 * c1 - b1 * c2) / det;
    let y = (a1 * c2 - a2 * c1) / det;
    if (x >= Math.min(x1, x2) &&
        x <= Math.max(x1, x2) &&
        x >= Math.min(x3, x4) &&
        x <= Math.max(x3, x4) &&
        y >= Math.min(y1, y2) &&
        y <= Math.max(y1, y2) &&
        y >= Math.min(y3, y4) &&
        y <= Math.max(y3, y4)) {
        return [x, y]
    } else {
        return null
    }
}

export function closestPointOnLine(x1, y1, x2, y2, x, y) {
    let a1 = y2 - y1
    let b1 = x1 - x2
    let c1 = a1 * x1 + b1 * y1
    let c2 = -b1 * x + a1 * y
    let det = a1 * a1 - -b1 * b1
    let cx = 0
    let cy = 0
    if (det !== 0) {
        cx = (a1 * c1 - b1 * c2) / det
        cy = (a1 * c2 - -b1 * c1) / det
    } else {
        cx = x
        cy = y
    }
    return [cx, cy]
}

// =========================================
// ========== SIMPLE MATRIX TOOLS ==========
// =========================================

export function multiplyMatrices(a, b) {
    let result = new Array(a.length).fill(0).map(row => new Array(b[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((_, j) => {
            return a[i].reduce((sum, elm, k) => sum + (elm * b[k][j]), 0)
        });
    });
}

export function get3DRotationMatrixX(theta) {
    return [
        [1, 0, 0],
        [0, Math.cos(theta), -Math.sin(theta)],
        [0, Math.sin(theta), Math.cos(theta)]
    ];
}

export function get3DRotationMatrixY(theta) {
    return [
        [Math.cos(theta), 0, -Math.sin(theta)],
        [0, 1, 0],
        [Math.sin(theta), 0, Math.cos(theta)]
    ];
}

export function get3DRotationMatrixZ(theta) {
    return [
        [Math.cos(theta), -Math.sin(theta), 0],
        [Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 1]
    ];
}


// =============================
// ========= Matricies =========
// =============================

export class Matrix {
    // Matrix, complete with basic matrix functionality.
    // 
    // Example
    // ------
    // 
    // A = new Matrix([[1,0],[0,1]])
    // B = new Matrix([[2,4]])
    // C = B.multiply(A)
    // C === B
    constructor(
        data    // 2D Array
    ) {
        this.data = data.map(row => Array.isArray(row) ? row : [row]);
        this.rows = this.data.length;
        this.cols = this.data[0].length;
    }

    toString() {
        // Returns the matrix as a string
        return this.data.map(row => row.join(' ')).join('\n');
    }

    add(
        matrix    // Matrix
    ) {
        // Adds the matrix to another matrix element by element
        if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
            throw new Error(`Matrix dimensions must match - ${this.rows}X${this.cols} vs ${matrix.rows}X${matrix.cols}`)
        }

        let result = this.data.map((row, i) => {
            return row.map((val, j) => {
                return val + matrix.data[i][j];
            });
        });

        return new Matrix(result);
    }

    subtract(
        matrix    // Matrix
    ) {
        // Substracts the parsed  matrix element-wise from this matrix
        if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
            throw new Error(`Matrix dimensions must match - ${this.rows}X${this.cols} vs ${matrix.rows}X${matrix.cols}`)
        }

        let result = this.data.map((row, i) => {
            return row.map((val, j) => {
                return val - matrix.data[i][j];
            });
        });

        return new Matrix(result)
    }

    _multiplyByMatrix(
        matrix    // Matrix
    ) {
        // Performs matrix multiplication between this matrix and the parsed
        // matrix
        if (this.cols !== matrix.rows) {
            throw new Error(`Matrix dimensions incompatible - ${this.rows}X${this.cols} vs ${matrix.rows}X${matrix.cols}`)
        }

        const result = [];
        for (let i = 0; i < this.rows; i++) {
            result[i] = [];
            for (let j = 0; j < matrix.cols; j++) {
                let sum = 0;
                for (let k = 0; k < this.cols; k++) {
                    sum += this.data[i][j] * matrix.data[i][j]
                }
                result[i][j] = sum;
            }
        }
        return new Matrix(result)
    }

    _multiplyByScalar(
        scalar    // Float/Int/Decimal
    ) {
        // Multiply this matrix element-wise by the scalar
        const result = this.data.map(row =>
            row.map(value => value * scalar)
        );

        return new Matrix(result);
    }

    multiply(
        arg    // Scalar or Matrix
    ) {
        // Multiplies the matrix by the passed object.
        // 
        // If a scalar is passed, it multiplies each element
        // by the scalar.
        // If a matrix is passed, it performs matrix-multiplication
        if (typeof arg === 'number') {
            let result = this._multiplyByScalar(arg);
            return result
        }
        else {
            let result = this._multiplyByMatrix(arg);
            return result
        }

    }

    divide(
        scalar    // Int/Float/Decimal
    ) {
        // Divide the matrix element-wise by the scalar
        if (scalar === 0) {
            throw new Error('Cannot divide by zero');
        }

        const result = this.data.map(row =>
            row.map(value => value / scalar)
        );

        return new Matrix(result);
    }

    dot(
        matrix    // Matrix
    ) {
        // Takes the dot-product between the two matricies
        if (this.cols !== matrix.cols || this.rows !== matrix.rows) {
            throw new Error(`Matrix dimensions incompatible - ${this.rows}X${this.cols} vs ${matrix.rows}X${matrix.cols}`)
        }

        let sum = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                sum += this.data[i][j] * matrix.data[i][j];
            }
        }
        return sum;
    }
}

export class Vector extends Matrix {
    // A matrix subclass designed to handle vectors
    // 
    // Example
    // ------
    // 
    // A = new Vector([1,2,3])
    // B = A.add(2)
    // B === new Vector([3,4,5])
    constructor(
        data    // Array
    ) {
        let matrix = data.map(x => [x])
        super(matrix);
    }

    toString() {
        // Returns the vector as a string
        return super.toString();
    }

    add(
        vector    // Vector
    ) {
        // Adds two vectors element-wise.
        const resultMatrix = super.add(vector);
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    subtract(
        vector    // Vector
    ) {
        // Subtracts two vectors element-wise.
        const resultMatrix = super.subtract(vector);
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    divide(
        scalar    // Int/Float/Decimal
    ) {
        // Divide the vector element-wise by the scalar
        const resultMatrix = super.divide(scalar)
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    multiply(
        arg    // Scalar or Vector
    ) {
        // Multiplies the vector by the passed object.
        // 
        // If a scalar is passed, it multiplies each element
        // by the scalar.
        // If a vector is passed, it performs matrix-multiplication
        const resultMatrix = super.multiply(arg)
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    length() {
        // Returns the 2norm of the vector.
        return Math.sqrt(this.data.reduce((acc, val) => acc + val[0] * val[0], 0))
    }
}
