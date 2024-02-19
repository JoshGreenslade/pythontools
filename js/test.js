import {Vector2D} from './mathsV2.js'
import {Circle2D, collideCircles} from './bodies.js'
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

let lines = []
let particles = []
for (let i = 0; i < 1000; i++){
    let pos = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
    let big = Math.random() > 0.999
    let circle = new Circle2D(pos, big ? 0.005 : 0.002)
    circle.mass = big ? 10000: 0.1
    circle.linearVelocity = new Vector2D(2*(Math.random()-0.5), 2*(Math.random()-0.5))
    big ? circle.linearVelocity.multiply(0.003):  circle.linearVelocity.multiply(0.00)
    circle.color = 'hsl(' + (Math.random() * 360) + ', 50%, 50%)';
    particles.push(circle)
    lines.push(lineLayer.add({
            data: [[circle.position.X, circle.position.Y]],
            color: circle.color,
            strokeWidth: -1,
            markerSize: circle.radius,
            markerShadowSize: -1
        }))
}

const framerate = new FramerateDisplay()

function draw(){
    for (let i = 0; i < particles.length; i++)
    {
        let particle = particles[i]
        particle.move(particle.linearVelocity)
    }
    for (let i = 0; i < particles.length; i++)
    {
        let particle_i = particles[i]
        let line = lines[i]
        for (let j = i+1; j < particles.length; j++)
        {
            let particle_j = particles[j]
            collideCircles(particle_i, particle_j)
            
        }
        if (particle_i.position.X >= 1){
            particle_i.position.X = 1
            particle_i.linearVelocity.X *= -1
        }
        if (particle_i.position.X <= -1){
            particle_i.position.X = -1
            particle_i.linearVelocity.X *= -1
        }
        if (particle_i.position.Y >= 1){
            particle_i.position.Y = 1
            particle_i.linearVelocity.Y *= -1
        }
        if (particle_i.position.Y <= -1){
            particle_i.position.Y = -1
            particle_i.linearVelocity.Y *= -1
        }
        line.update({
            data: [[particle_i.position.X, particle_i.position.Y]],
        })
    }
    requestAnimationFrame(draw); // Request the next frame
}

draw(); // Start the drawing loop