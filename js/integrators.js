// First-order ODE integrators

// An Ordinary Differential Equation is one where the function 
// only contains one independent variable and its derivitives.
// The order of the ODE is given by the highest order in the
// derivitive.

// =============================
// ===== Utility Functions =====
// =============================

function addVector(a, b) {
  // Add two compatible vectors together element-wise
  return a.map((e, i) => e + b[i]);
}

function multiplyVectorByScalar(scalar, v) {
  // Multiply a vector by a scalar
  return v.map(x => x * scalar)
}

// =============================
// ======== Integrators ========
// =============================

export function euler({
  dydt,             // Callable
  state0,           // Array
  t_span,           // Array
  step_size = null, // Float
  n_steps = null    // Int
}) {
  // A first-order ODE solver using Eulers method
  // 
  // Example
  // ------
  // 
  // A particle falling under gravity in 1D.
  // 
  // euler({
  //   dydt: (t, y) => [y[1], -9.81],
  //   y0: [0, 20], 
  //   t_span: [0, 5],
  //   n_steps: 5})
  let t_start, t_end, step, y_new, t_new;

  if (step_size === null && n_steps === null ||
    step_size !== null && n_steps !== null) {
    throw new Error("Only one of step_size or n_steps must be set")
  }

  [t_start, t_end] = t_span

  if (step_size === null) {
    step_size = (t_end - t_start) / n_steps
  } else if (n_steps === null) {
    n_steps = Math.ceil((t_end - t_start) / step_size)
  }

  var t_array = [t_start]
  var y_array = [state0]
  let y = state0
  let t = t_start

  for (let i = 0; i < n_steps; i++) {
    step = multiplyVectorByScalar(step_size, dydt(t, y))
    y_new = addVector(y, step)
    t_new = t + step_size
    y_array.push(y_new)
    t_array.push(t_new)
    y = y_new
    t = t_new
  }

  return [t_array, y_array]

}


export function verlet({
  dydt,              // Function returning [x_vel, y_vel, x_acc, y_acc]
  state0,            // Initial state: [x_position, y_position, x_velocity, y_velocity]
  t_span,            // Array: [start_time, end_time]
  n_steps,           // Integer
  step_size = null   // Float
}) {
  // A velocity Verlet integrator
  // https://en.wikipedia.org/wiki/Verlet_integration
  // 
  // Example
  // ------
  // 
  // A particle falling under gravity in 1D.
  // 
  // verlet({
  //   dydt: (t, y) => [y[1], -9.81],
  //   y0: [0, 20], 
  //   t_span: [0, 5],
  //   n_steps: 5})
  let x, y, vx, vy;
  let xNew, yNew, vxNew, vyNew;
  let newState, tempState, newerState

  let [t_start, t_end] = t_span;
  let dt = step_size || (t_end - t_start) / n_steps;
  var t_array = [t_start];
  var y_array = state0;
  let t = t_start;
  let state = state0

  for (let i = 0; i < n_steps; i++) {
    [x, y, vx, vy] = state

    // Calculate the new state
    newState = dydt(t, state)
    xNew = x + vx * dt + 0.5 * newState[2] * dt * dt
    yNew = y + vy * dt + 0.5 * newState[3] * dt * dt
    tempState = [xNew, yNew, vx, vy]
    newerState = dydt(t, tempState)
    vxNew = vx + 0.5 * (newState[2] + newerState[2]) * dt
    vyNew = vy + 0.5 * (newState[3] + newerState[3]) * dt
    state = [xNew, yNew, vxNew, vyNew]

    // Update the output arrays and time
    y_array.push(state)
    t += dt
    t_array.push(t)
  }

  return [t_array, y_array];
}

