const arrayColumn = (arr, n) => arr.map(x => x[n]);

function addVector(a, b){
  return a.map((e,i) => e + b[i]);
}

function multiplyVectorByScalar(scalar, v) {
  return v.map(x => x * scalar)
}

export default function euler({
  dydt,             // Callable
  y0,               // Array
  t_span,           // Array
  step_size = null, // Float
  n_steps = null    // Int
  }) {
  // 
  // A first-order ODE solver

  let t_start, t_end, step, y_new, t_new;

  if (step_size === null && n_steps === null || 
      step_size !== null && n_steps !== null ) {
    throw new Error("Only one of step_size or n_steps must be set")
  }

  [t_start, t_end] = t_span

  if (step_size === null) {
    step_size = (t_end - t_start)/n_steps
  } else if (n_steps === null) {
    n_steps = Math.ceil((t_end - t_start)/step_size)
  }

  var t_array = [t_start]
  var y_array = [y0]
  let y = y0
  let t = t_start

  for (let i = 0; i < n_steps; i++) {
    step =  multiplyVectorByScalar(step_size, dydt(t, y))
    y_new = addVector(y, step)
    t_new = t + step_size
    y_array.push(y_new)
    t_array.push(t_new)
    y = y_new
    t = t_new
  }

  return [t_array, y_array]

}

console.log(euler({
  dydt: (t, y) => [y[1], -9.81],
  y0: [0, 20], 
  t_span: [0, 5],
  n_steps: 5})
)