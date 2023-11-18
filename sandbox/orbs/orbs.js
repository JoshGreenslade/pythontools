import { 
  createSVG,
  GridLayer, 
  LineLayer,  } from "../../js/plotting.js";

const backgroundColor = 'hsl(0, 0%, 90%)'
const width = 800;
const height = 800;
const margin = 10;


document.body.style.backgroundColor = backgroundColor

//  Create the svg that everything will be plotted on 
var svg = createSVG('.orbs', width, height, margin)

// Create the coordinate system 
const gridLayer = new GridLayer(svg, {
  xDomain: [-1, 1],
  yDomain: [-1, 1]
})
gridLayer.setAxesCenter(0, 0)

const lineLayer = new LineLayer(svg, gridLayer)
let sunXpos = 0.5
let sunYpos = 0
let sunLine = lineLayer.add({ 
  data: [[sunXpos, sunYpos]], 
  markerSize: 30}
)

let mouseX = 0
let mouseY = 0

document.addEventListener('mousemove', function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  sunXpos = gridLayer.xScale.invert(mouseX)
  sunYpos = gridLayer.yScale.invert(mouseY)
  console.log()
  sunLine.update({
    data: [[ sunXpos , sunYpos ]]
  })
});


function createParticle() {
  let xPos = Math.random()*2 - 1
  let yPos = Math.random()*2 - 1
  let color = 'hsl(0, 50%, 50%)'
  
  return {
    xPos: xPos,
    yPos: yPos,
    xVel: 0,
    yVel: 0,
    color: color,
    age: 0,
    dead: false,
    line: lineLayer.add({
      data: [[xPos, yPos]],
      markerSize: 10,
      color: color
    }),
    update: function(){
      this.age += 1
      if (this.age > 1000 || Math.abs(this.xPos - sunXpos) < 0.05 && Math.abs(this.yPos - sunYpos) < 0.05) {
        this.kill()
        this.dead = true
        return
      }
      this.xPos += this.xVel 
      this.yPos += this.yVel
      this.line.update({ data: [[this.xPos, this.yPos]]})
    },
    kill: function(){
      this.line.remove()
      this.dead = true
    }
  }
}

let particleArray = []
const G = 2e-5
const M = 1
particleArray.push(createParticle())
var intervalId = window.setInterval(function () {
  particleArray = particleArray.filter(particle => !particle.dead)
  particleArray.forEach(particle => {
    const r2 = (particle.xPos - sunXpos) ** 2 + (particle.yPos - sunYpos) ** 2
    const theta = Math.atan2(particle.yPos - sunYpos, particle.xPos - sunXpos)
    particle.xVel += -1*(M*G/r2) * Math.cos(theta)
    particle.yVel += -1*(M*G/r2) * Math.sin(theta)
    particle.update()
  });
}, 10);

var intervalId2 = window.setInterval(function () {
  particleArray.push(createParticle())
}, 10);