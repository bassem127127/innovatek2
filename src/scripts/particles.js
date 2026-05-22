/* ============================================
   INNOVATEK — Particle Canvas Background
   ============================================ */

import { lerp } from './utils.js';

const PARTICLE_CONFIG = {
  count: 80,
  maxSpeed: 0.3,
  connectionDistance: 150,
  particleRadius: 1.5,
  lineOpacity: 0.12,
  mouseInfluenceRadius: 200,
  colors: ['#00b4d8', '#00f0ff', '#7b2fff'],
};

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  }

  reset(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.velocityX = (Math.random() - 0.5) * PARTICLE_CONFIG.maxSpeed;
    this.velocityY = (Math.random() - 0.5) * PARTICLE_CONFIG.maxSpeed;
    this.radius = Math.random() * PARTICLE_CONFIG.particleRadius + 0.5;
    this.color = PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)];
    this.opacity = Math.random() * 0.5 + 0.3;
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.x < 0 || this.x > canvasWidth) this.velocityX *= -1;
    if (this.y < 0 || this.y > canvasHeight) this.velocityY *= -1;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.globalAlpha = this.opacity;
    context.fill();
    context.globalAlpha = 1;
  }
}

export function initParticles(canvasElement) {
  if (!canvasElement) return;

  const context = canvasElement.getContext('2d');
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let animationFrameId;

  function resizeCanvas() {
    const parent = canvasElement.parentElement;
    canvasElement.width = parent.offsetWidth;
    canvasElement.height = parent.offsetHeight;
  }

  function createParticles() {
    particles = Array.from(
      { length: PARTICLE_CONFIG.count },
      () => new Particle(canvasElement.width, canvasElement.height)
    );
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const deltaX = particles[i].x - particles[j].x;
        const deltaY = particles[i].y - particles[j].y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < PARTICLE_CONFIG.connectionDistance) {
          const opacity = (1 - distance / PARTICLE_CONFIG.connectionDistance) * PARTICLE_CONFIG.lineOpacity;
          context.beginPath();
          context.moveTo(particles[i].x, particles[i].y);
          context.lineTo(particles[j].x, particles[j].y);
          context.strokeStyle = `rgba(0, 180, 216, ${opacity})`;
          context.lineWidth = 0.5;
          context.stroke();
        }
      }
    }
  }

  function applyMouseInfluence() {
    for (const particle of particles) {
      const deltaX = mouseX - particle.x;
      const deltaY = mouseY - particle.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < PARTICLE_CONFIG.mouseInfluenceRadius) {
        const force = (PARTICLE_CONFIG.mouseInfluenceRadius - distance) / PARTICLE_CONFIG.mouseInfluenceRadius;
        particle.x = lerp(particle.x, particle.x - deltaX * 0.02, force);
        particle.y = lerp(particle.y, particle.y - deltaY * 0.02, force);
      }
    }
  }

  function animate() {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    for (const particle of particles) {
      particle.update(canvasElement.width, canvasElement.height);
      particle.draw(context);
    }

    drawConnections();
    applyMouseInfluence();

    animationFrameId = requestAnimationFrame(animate);
  }

  function handleMouseMove(event) {
    const rect = canvasElement.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  }

  function handleMouseLeave() {
    mouseX = -1000;
    mouseY = -1000;
  }

  // Initialize
  resizeCanvas();
  createParticles();
  animate();

  // Event listeners
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  canvasElement.parentElement.addEventListener('mousemove', handleMouseMove);
  canvasElement.parentElement.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationFrameId);
    canvasElement.parentElement.removeEventListener('mousemove', handleMouseMove);
    canvasElement.parentElement.removeEventListener('mouseleave', handleMouseLeave);
  };
}
