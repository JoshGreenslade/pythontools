import {
  verlet
} from '../integrators.js'
import {
  Particle2DSystem,
  Particle2D
} from '../physics.js'

import {
  createSVG,
  GridLayer,
  LineLayer,
  DebugPosition,
} from '../plotting.js'

const backgroundColour = `hsl(180, 0%, 2%)`
document.body.style.backgroundColor = backgroundColour
const margin = 0
const height = screen.height * 0.9
const aspect_ratio = screen.width / screen.height
const width = screen.width * 0.8

var svg = createSVG(".area", width, height)

const gridLayer = new GridLayer(svg, {
  height: height,
  xDomain: [0, 1 * aspect_ratio],
  xRange: [0, screen.width * 0.8],
  yDomain: [0, 1],
  yRange: [screen.height * 0.9, 0],
  margin: margin
})

const lineLayer = new LineLayer(svg, gridLayer)


// ---

function salpeterIMF(alpha, m_min, m_max) {
  // Generate a random number between 0 and 1
  const rand = Math.random();

  // Inverse transform sampling for power-law distribution
  return Math.pow((Math.pow(m_max, 1 - alpha) - Math.pow(m_min, 1 - alpha)) * rand + Math.pow(m_min, 1 - alpha), 1 / (1 - alpha));
}


let n_particles = 3000
let dt = 0.1
const g = 5e0
const maxA = 999
const maxV = 999

let particleManager = new Particle2DSystem({})

function dist(particleA, particleB) {
  return Math.hypot(particleA.x - particleB.x, particleA.y - particleB.y)
}
function torDist(particleA, particleB) {
  let dx = Math.abs(particleB.x - particleA.x)
  let dy = Math.abs(particleB.y - particleA.y)
  if (dx > 1 * aspect_ratio / 2) {
    dx = 1 * aspect_ratio - dx
  }
  if (dy > 0.5) {
    dy = 1.0 - dx
  }
  return Math.sqrt(dx**2 + dy**2)
}

particleManager.update = (dt) => {
  let self = particleManager
  for (let i = 0; i < self.particles.length; i++) {
      let particle = self.particles[i]
      for (const particleb of self.particles) {
          if (particle === particleb) {
              continue
          }
          if (particleb.mass < 0.000001) {
              continue
          }

          let r = torDist(particle, particleb)
          if ((r < 100) && (r > particleb.radius)) {
              let dx = Math.abs(particleb.x - particle.x)
              let dy = Math.abs(particleb.y - particle.y)
              if (dx > 1 * aspect_ratio / 2.0) {
                dx = 1 * aspect_ratio - dx
              }
              if (dy > 0.5) {
                dy = 1.0 - dx
              }
              let theta = Math.atan2(dy, dx)
              particle.applyForce(
                  Math.cos(theta) * g * particle.mass * particleb.mass / r ** 2,
                  Math.sin(theta) * g * particle.mass * particleb.mass / r ** 2,
              )

          }
      }
      if (particle.xAcc > maxA / particle.mass) {
          particle.xAcc = maxA / particle.mass
      }
      if (particle.xAcc < -maxA / particle.mass) {
          particle.xAcc = -maxA / particle.mass
      }
      if (particle.yAcc > maxA / particle.mass) {
          particle.yAcc = maxA / particle.mass
      }
      if (particle.yAcc < -maxA / particle.mass) {
          particle.yAcc = -maxA / particle.mass
      }
      let dydt = (t, state) => [
          state[2],
          state[3],
          particle.xAcc,
          particle.yAcc]
      particle.update({
          dt: dt,
          dydt: dydt,
          integrator: verlet,
          n_steps: 1
      })

      if (particle.y <= 0.0) {
          particle.y =  1 + particle.y
          // particle.yVel *= -1
      }
      if (particle.x <= 0.0) {
          particle.x =  1 * aspect_ratio + particle.x
          // particle.xVel *= -1
      }
      if (particle.y >= 1 ) {
          particle.y = particle.y -  1
          // particle.yVel *= -1
      }
      if (particle.x >= 1 * aspect_ratio) {
          particle.x = particle.x -  1 * aspect_ratio
          // particle.xVel *= -1
      }
      if (particle.xVel > maxV) {
          particle.xVel = maxV
      }
      if (particle.xVel < -maxV) {
          particle.xVel = -maxV
      }
      if (particle.yVel > maxV) {
          particle.yVel = maxV
      }
      if (particle.yVel < -maxV) {
          particle.yVel = -maxV
      }

      particle.xVel *= 0.9
      particle.yVel *= 0.9

  }
  // self.handleCollisions()
}

let lines = [];

for (let i = 0; i < n_particles; i++) {
  let radius = salpeterIMF(2.35, 0.02 / 100, 100.0 / 100)
  let particle = new Particle2D({
      mass: radius ** 3,
      radius: radius,
      x: Math.random() * 1 * aspect_ratio,
      y: Math.random(),
      // xVel: 0,
      // yVel: 0
      // xVel: (Math.random() - 0.5) / (10000 * radius),
      // yVel: (Math.random() - 0.5) / (10000 * radius),
      // canCollide: radius ** 3 < 0.000001 ? true : false
      canCollide: true 
  })
  particleManager.addParticle(particle)

  lines.push(lineLayer.add({
      data: [[particle.x, particle.y]],
      color: `hsl(${(Math.random() * 360)}, 50%, 50%)`,
      strokeWidth: -1,
      markerSize: particle.mass > 0.000001 ? radius * 880 : radius * 880,
      markerShadowSize: -1
  }))
}

d3.interval(() => {
  particleManager.update(dt)
  for (let i = 0; i < particleManager.particles.length; i++) {
      let particle = particleManager.particles[i]
      let line = lines[i]
      line.update({
          data: [[particle.x, particle.y]],
      })
  }
})
