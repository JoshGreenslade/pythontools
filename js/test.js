import {Vector2D} from './mathsV2.js'
import {Box2D, Circle2D, collideCircles, colllidePolygons} from './bodies.js'
import {
    createSVG,
    GridLayer,
    LineLayer,
    DebugPosition,
    addDefaultStyles,
    FramerateDisplay,
    PolygonLayer
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
const polygonLayer = new PolygonLayer(svg, gridLayer)

let polygons = []
let particles = []
for (let i = 0; i < 500; i++){
    let pos = new Vector2D(2*(Math.random() -0.5), 2*(Math.random() -0.5))
    let vel = new Vector2D(2*(Math.random() -0.5), 2*(Math.random() -0.5))
    vel.multiply(0.005)
    let box = new Box2D(0.1, 0.1, pos)
    box.linearVelocity = vel
    particles.push(box)
    polygons.push(polygonLayer.add({
            data: [box.getTransformedVerticies()],
            strokeWidth: 1
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
        let polygon = polygons[i]
        for (let j = i+1; j < particles.length; j++)
        {
            let particle_j = particles[j]
            colllidePolygons(particle_i, particle_j)
            
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
        polygon.update({
            data: [particle_i.getTransformedVerticies()],
        })
    }
    requestAnimationFrame(draw); // Request the next frame
}

draw(); // Start the drawing loop