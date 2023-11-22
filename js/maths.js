// Maths

// A suite of tools and utilities for mathematical
// operations.

// ===============
// === Vectors ===
// ===============

export class Matrix {
    constructor(data) {
        this.data = data.map(row => Array.isArray(row) ? row : [row]);
        this.rows = this.data.length;
        this.cols = this.data[0].length;
    }

    toString() {
        return this.data.map(row => row.join(' ')).join('\n');
    }

    add(matrix) {
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

    subtract(matrix) {
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

    _multiplyByMatrix(matrix) {
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

    _multiplyByScalar(scalar) {
        const result = this.data.map(row =>
            row.map(value => value * scalar)
        );

        return new Matrix(result);
    }

    multiply(arg) {
        if (typeof arg === 'number') {
            let result = this._multiplyByScalar(arg);
            return result
        }
        else {
            let result = this._multiplyByMatrix(arg);
            return result
        }

    }

    divide(scalar) {
        if (scalar === 0) {
            throw new Error('Cannot divide by zero');
        }

        const result = this.data.map(row =>
            row.map(value => value / scalar)
        );

        return new Matrix(result);
    }

    dot(matrix) {
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
    constructor(data) {
        let matrix = data.map(x => [x])
        super(matrix);
    }

    toString() {
        return super.toString();
    }

    add(vector) {
        const resultMatrix = super.add(vector);
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    subtract(vector) {
        const resultMatrix = super.subtract(vector);
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    divide(scalar) {
        const resultMatrix = super.divide(scalar)
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    multiply(arg) {
        const resultMatrix = super.multiply(arg)
        return new Vector(resultMatrix.data.map(row => row[0]));
    }

    length() {
        return Math.sqrt(this.data.reduce((acc, val) => acc + val[0] * val[0], 0))
    }
}
