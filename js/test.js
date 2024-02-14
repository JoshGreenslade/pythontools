import {Vector2D} from './mathsV2.js'
import {Circle2D} from './bodies.js'
import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition,
    addDefaultStyles,
    FramerateDisplay
} from './plotting.js'

const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
canvas.width = 800;
canvas.height = 800;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');


const backgroundColour = `hsl(180, 0%, 5%)`
document.body.style.backgroundColor = backgroundColour
const margin = 0
const height = 800
const width = 800

var svg = createSVG(".area", width, height)
addDefaultStyles()

const gridLayer = new GridLayer(svg, {
    height: height,
    xDomain: [-1, 1],
    xRange: [0, width],
    yDomain: [-1, 1],
    yRange: [height, 0],
    margin: margin
})

gridLayer.setYAxesCenter(0)
gridLayer.setXAxesCenter(0)
DebugPosition(gridLayer)

const lineLayer = new LineLayer(svg, gridLayer)


let particles = []
for (let i = 0; i < 8000; i++){
    let pos = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
    let circle = new Circle2D(pos, 0.011)
    circle.linearVelocity = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
    circle.linearVelocity.multiply(0.1)
    circle.color = 'hsl(' + (Math.random() * 360) + ', 50%, 50%)';
    particles.push(circle)
}


// let lines = []
// let particles = []
// for (let i = 0; i < 4000; i++){
//     let pos = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
//     let circle = new Circle2D(pos, 0.01)
//     circle.linearVelocity = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
//     circle.linearVelocity.multiply(0.001)
//     circle.color = 'hsl(' + (Math.random() * 360) + ', 50%, 50%)';
//     particles.push(circle)
//     lines.push(lineLayer.add({
//             data: [[circle.position.X, circle.position.Y]],
//             color: circle.color,
//             strokeWidth: -1,
//             markerSize: circle.radius,
//             markerShadowSize: -1
//         }))
// }

// let data = []
// let particles = []
// for (let i = 0; i < 4000; i++){
//     let pos = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
//     let circle = new Circle2D(pos, 1)
//     circle.linearVelocity = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
//     circle.linearVelocity.multiply(0.001)
//     circle.color = 'hsl(' + (Math.random() * 360) + ', 50%, 50%)';
//     particles.push(circle)
//     data.push([circle.position.X, circle.position.Y])
// }
// let line = lineLayer.add({
//     data: data,
//     color: 'hsl(' + (Math.random() * 360) + ', 50%, 50%)',
//     strokeWidth: -1,
//     markerSize: 0.01,
//     markerShadowSize: -1
// })

const framerate = new FramerateDisplay()


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for the new frame
    
    ctx.beginPath();
    ctx.moveTo(0, 400); // Start at the left edge of the canvas, at the vertical center
    ctx.lineTo(canvas.width, 400); // Draw to the right edge of the canvas
    ctx.strokeStyle = '#FFFFFF'; // White color for the axis
    ctx.stroke();

    // Draw Y axis
    ctx.beginPath();
    ctx.moveTo(400, 0); // Start at the left edge of the canvas, at the vertical center
    ctx.lineTo(400, canvas.height); // Draw to the right edge of the canvas
    ctx.strokeStyle = '#FFFFFF'; // White color for the axis
    ctx.stroke();

    particles.forEach(particle => {
        // Update particle position based on velocity
        particle.move(particle.linearVelocity)
        particle.linearVelocity.multiply(0.9)

        // Draw particle as a circle on the canvas
        ctx.beginPath();
        ctx.arc(400*particle.position.X + canvas.width / 2, 
                -400*particle.position.Y + canvas.height / 2, 
                400*particle.radius, 
                0, 
                Math.PI * 2);
        ctx.fillStyle =  particle.color
        ctx.fill();
    });
    requestAnimationFrame(draw); // Request the next frame
}

// function draw(){
//     for (let i = 0; i < particles.length; i++)
//     {
//         let particle = particles[i]
//         let line = lines[i]
//         particle.move(particle.linearVelocity)
//         line.update({
//             data: [[particle.position.X, particle.position.Y]],
//         })
//     }
//     requestAnimationFrame(draw); // Request the next frame
// }

// function draw(){
//     let data = []
//     for (let i = 0; i < particles.length; i++)
//     {
//         let particle = particles[i]
//         particle.move(particle.linearVelocity)
//         data.push([particle.position.X, particle.position.Y])
//     }
//     line.update({
//         data: data,
//     })
//     requestAnimationFrame(draw); // Request the next frame
// }

draw(); // Start the drawing loop