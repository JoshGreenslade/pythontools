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
  dydt,              // Function returning [x_vel, y_vel, x_acc, y_acc]*N - where N is the number of particles
  state0,            // Initial state: [x_position, y_position, x_velocity, y_velocity]*N
  t_span,            // Array: [start_time, end_time]
  n_steps,           // Integer
  step_size = null,  // Float
  kwargs = {}        // Additional Arguments
}) {
  // A velocity Verlet integrator
  // https://en.wikipedia.org/wiki/Verlet_integration
  // 
  // Example
  // ------
  // 
  // A particle falling under gravity in 1D.
  // 
  // If dydt takes in additional arguments, they can be passed in using
  // kwargs.
  // 
  // verlet({
  //   dydt: (t, y) => [y[1], -9.81],
  //   y0: [0, 20], 
  //   t_span: [0, 5],
  //   n_steps: 5})

  let [t_start, t_end] = t_span;
  let dt = step_size || (t_end - t_start) / n_steps;
  var t_array = [t_start];
  var y_array = [state0];
  let t = t_start;
  let state = state0;
  let N = state.length / 4;   // Assuming [x, y, xVel, yVel] per particle

  for (let i = 0; i < n_steps; i++) {
    let newState = new Array(state.length)
    let accelerations = dydt(t, state, kwargs)

    for (let j = 0; j < N; j++){ 
      let baseIndex = j * 4;
      let [x, y, vx, vy] = state.slice(baseIndex, baseIndex+4);
      let [vxNew, vyNew, ax, ay] = accelerations.slice(baseIndex, baseIndex + 4);

      // Update positions
      let xNew = x + vx * dt + 0.5 * ax * dt * dt;
      let yNew = y + vy * dt + 0.5 * ay * dt * dt;


      newState[baseIndex] = xNew;
      newState[baseIndex + 1] = yNew;
      newState[baseIndex + 2] = vxNew; // These will be updated again after recalculating accelerations
      newState[baseIndex + 3] = vyNew;
    }
    // Recalculate accelerations with new positions
    let newAccelerations = dydt(t + dt, newState, kwargs);

    for (let j = 0; j < N; j++) {
      let baseIndex = j * 4;
      let [vx, vy] = state.slice(baseIndex + 2, baseIndex + 4);
      let [axNew, ayNew] = newAccelerations.slice(baseIndex + 2, baseIndex + 4);

      // Update velocities
      newState[baseIndex + 2] = vx + 0.5 * (accelerations[baseIndex + 2] + axNew) * dt;
      newState[baseIndex + 3] = vy + 0.5 * (accelerations[baseIndex + 3] + ayNew) * dt;
    }

    // Update the output arrays and time
    state = newState;
    t += dt;
    y_array.push(state);
    t_array.push(t);
  }

  return [t_array, y_array];
}

