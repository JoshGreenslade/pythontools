import euler from "./integrators.js";

console.log('hello world')
const circle = document.getElementById("projectile")

// Initial position and velocity
let y = [50, 50, 50, 50];  // [position, velocity]

var time_span = [0, 0.016]
let lastTimestamp = null;
let frameRateDisplay = document.createElement("div");
document.body.appendChild(frameRateDisplay);

function animateProjectile(timestamp) {

  if (lastTimestamp !== null) {
    let deltaTime = (timestamp - lastTimestamp) / 1000.0;  // time in seconds
    let frameRate = 1 / deltaTime;
    frameRateDisplay.innerText = `Frame rate: ${(frameRate)} fps`;
    if (deltaTime !== null && isNaN(deltaTime) === false) {
      console.log(deltaTime)
      time_span = [0, deltaTime]
    }
  }
  lastTimestamp = timestamp;
  console.log(time_span)
  
  // Update position and velocity using the Euler method
  let [t, updatedY] = euler({
      dydt: (t, y) => [y[1], -9.81, y[3], 0],
      y0: y, 
      t_span: time_span,  // Small time span for each frame
      n_steps: 1
  });
  y = updatedY[updatedY.length - 1];

  // Update circle position in SVG
  circle.setAttribute("cy", 550 - y[0]);  // Subtracting from 550 to flip the direction (because SVG's coordinate system has (0,0) at the top-left corner)
  circle.setAttribute("cx", y[2]);  // Subtracting from 550 to flip the direction (because SVG's coordinate system has (0,0) at the top-left corner)

  // Call this function again for the next frame
  requestAnimationFrame(animateProjectile);
}


// Start the animation
animateProjectile();
