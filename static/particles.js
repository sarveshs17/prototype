/**
 * Interactive Particle Canvas Background
 * Premium subtle glowing cyan particles and connecting neural filaments.
 * Lightweight, performant (60 FPS), DPR-aware, non-blocking (pointer-events: none),
 * with mouse reactivity and prefers-reduced-motion compliance.
 */
class ParticleBackground {
  constructor(options = {}) {
    this.options = Object.assign({
      particleCount: 55,
      maxDistance: 130,
      particleColor: "rgba(103, 232, 249, 0.75)",
      brightColor: "rgba(34, 211, 238, 0.95)",
      lineColor: "rgba(103, 232, 249, 0.12)",
      mouseLineColor: "rgba(34, 211, 238, 0.22)",
      mouseRadius: 160,
      speed: 0.35,
      minRadius: 1.0,
      maxRadius: 2.2
    }, options);

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.animFrameId = null;
    this.dpr = window.devicePixelRatio || 1;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
  }

  init() {
    this.createCanvas();
    this.bindEvents();
    this.createParticles();

    if (this.reducedMotion) {
      this.renderStatic();
    } else {
      this.animate();
    }
  }

  createCanvas() {
    let canvas = document.getElementById("particleCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "particleCanvas";
      canvas.className = "particle-background-canvas";
      document.body.prepend(canvas);
    }
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.handleResize();
  }

  handleResize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Responsive particle count based on screen area
    const area = this.width * this.height;
    const targetCount = Math.max(30, Math.min(75, Math.floor(area / 18000)));
    this.options.particleCount = targetCount;

    if (this.particles.length === 0 || Math.abs(this.particles.length - targetCount) > 15) {
      this.createParticles();
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        radius: this.options.minRadius + Math.random() * (this.options.maxRadius - this.options.minRadius),
        isBright: Math.random() > 0.75,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => this.handleResize(), { passive: true });

    window.addEventListener("pointermove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    }, { passive: true });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", (e) => {
      this.reducedMotion = e.matches;
      if (this.reducedMotion) {
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.renderStatic();
      } else {
        this.animate();
      }
    });
  }

  update() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      // Bounce at boundaries
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Subtle mouse interaction (soft repulsion / drift)
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.options.mouseRadius && dist > 0) {
          const force = (1 - dist / this.options.mouseRadius) * 0.45;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const maxDist = this.options.maxDistance;

    // Draw connecting lines
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.14;
          this.ctx.strokeStyle = `rgba(103, 232, 249, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      // Draw line to pointer
      if (this.mouse.active) {
        const mdx = p1.x - this.mouse.x;
        const mdy = p1.y - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < this.options.mouseRadius) {
          const mAlpha = (1 - mdist / this.options.mouseRadius) * 0.25;
          this.ctx.strokeStyle = `rgba(34, 211, 238, ${mAlpha})`;
          this.ctx.lineWidth = 1.0;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const pulseSize = p.radius + Math.sin(p.pulse) * 0.3;

      this.ctx.fillStyle = p.isBright ? this.options.brightColor : this.options.particleColor;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.6, pulseSize), 0, Math.PI * 2);
      this.ctx.fill();

      // Subtle outer halo for bright particles
      if (p.isBright) {
        this.ctx.fillStyle = "rgba(34, 211, 238, 0.18)";
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, pulseSize * 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  animate() {
    this.update();
    this.draw();
    this.animFrameId = requestAnimationFrame(() => this.animate());
  }

  renderStatic() {
    this.draw();
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.particleBg = new ParticleBackground();
});

