/**
 * WDCOM Mídia Digital - Interactive Canvas Engine
 * Clean, elegant wallpaper background with autonomous 3D wireframe geometry,
 * crisp static dot/plus grid, topographic waves, ambient particles, and click shockwaves.
 * Mobile & Desktop Responsive 60 FPS Engine.
 */

class InteractiveBackgroundEngine {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse position (used strictly for click shockwaves)
    this.mouse = {
      x: this.width * 0.5,
      y: this.height * 0.5,
      down: false
    };

    // Color Palettes
    this.palettes = {
      wdcom: {
        name: 'WDCOM Original',
        bgGradient: ['#032b3d', '#064963', '#021e2c'],
        gridDot: 'rgba(255, 255, 255, 0.35)',
        gridPlus: 'rgba(255, 255, 255, 0.65)',
        accentCyan: '#00c3ff',
        accentTeal: '#008ba3',
        waveLine: 'rgba(0, 195, 255, 0.35)',
        wireframeLine: 'rgba(0, 195, 255, 0.7)',
        glow: 'rgba(0, 195, 255, 0.15)',
        particle: 'rgba(255, 255, 255, 0.8)'
      },
      sonafe: {
        name: 'SONAFE DF (Verde & Azul)',
        bgGradient: ['#04202d', '#083832', '#021820'],
        gridDot: 'rgba(255, 255, 255, 0.35)',
        gridPlus: 'rgba(123, 160, 54, 0.75)',
        accentCyan: '#7ba036',
        accentTeal: '#0066a1',
        waveLine: 'rgba(123, 160, 54, 0.4)',
        wireframeLine: 'rgba(0, 102, 161, 0.8)',
        glow: 'rgba(123, 160, 54, 0.25)',
        particle: 'rgba(255, 255, 255, 0.9)'
      },
      black: {
        name: 'Tela Preta (OLED Black)',
        bgGradient: ['#000000', '#000000', '#000000'],
        gridDot: 'rgba(255, 255, 255, 0.25)',
        gridPlus: 'rgba(0, 195, 255, 0.8)',
        accentCyan: '#00c3ff',
        accentTeal: '#00e5ff',
        waveLine: 'rgba(0, 195, 255, 0.4)',
        wireframeLine: 'rgba(0, 195, 255, 0.9)',
        glow: 'rgba(0, 195, 255, 0.2)',
        particle: 'rgba(255, 255, 255, 0.9)'
      },
      cyber: {
        name: 'Cyber Neon',
        bgGradient: ['#0a0814', '#150d2a', '#06040b'],
        gridDot: 'rgba(255, 0, 127, 0.35)',
        gridPlus: 'rgba(0, 229, 255, 0.65)',
        accentCyan: '#00e5ff',
        accentTeal: '#ff007f',
        waveLine: 'rgba(255, 0, 127, 0.4)',
        wireframeLine: 'rgba(0, 229, 255, 0.8)',
        glow: 'rgba(255, 0, 127, 0.2)',
        particle: 'rgba(0, 229, 255, 0.9)'
      },
      gold: {
        name: 'Midnight Gold',
        bgGradient: ['#09131d', '#132238', '#050a12'],
        gridDot: 'rgba(255, 214, 10, 0.3)',
        gridPlus: 'rgba(255, 183, 3, 0.65)',
        accentCyan: '#ffb703',
        accentTeal: '#fb8500',
        waveLine: 'rgba(255, 183, 3, 0.35)',
        wireframeLine: 'rgba(255, 214, 10, 0.75)',
        glow: 'rgba(255, 183, 3, 0.2)',
        particle: 'rgba(255, 214, 10, 0.9)'
      },
      emerald: {
        name: 'Emerald Matrix',
        bgGradient: ['#031811', '#083325', '#020f0b'],
        gridDot: 'rgba(163, 230, 53, 0.35)',
        gridPlus: 'rgba(0, 230, 118, 0.65)',
        accentCyan: '#00e676',
        accentTeal: '#a3e635',
        waveLine: 'rgba(0, 230, 118, 0.35)',
        wireframeLine: 'rgba(163, 230, 53, 0.75)',
        glow: 'rgba(0, 230, 118, 0.2)',
        particle: 'rgba(0, 230, 118, 0.9)'
      }
    };

    this.currentPaletteKey = 'wdcom';
    this.theme = this.palettes[this.currentPaletteKey];
    this.isPaused = false;

    // Simulation Data Structures
    this.gridNodes = [];
    this.gridSpacing = 50;
    this.tetrahedrons = [];
    this.shockwaves = [];
    this.dustParticles = [];
    this.wavePhase = 0;

    this.init();
  }

  init() {
    this.resize();
    this.setupEventListeners();
    this.createGrid();
    this.createTetrahedrons();
    this.createDustParticles();
    this.animate(0);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // Responsive grid spacing based on screen size
    this.gridSpacing = this.width < 600 ? 38 : 50;

    this.createGrid();
    this.createTetrahedrons();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousedown', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.triggerShockwave(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.triggerShockwave(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  setPalette(paletteKey) {
    if (this.palettes[paletteKey]) {
      this.currentPaletteKey = paletteKey;
      this.theme = this.palettes[paletteKey];
    }
  }

  triggerShockwave(x, y) {
    const maxR = Math.min(this.width, this.height) * 0.5;
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: Math.max(250, maxR),
      speed: 10,
      strength: 35,
      alpha: 1
    });
  }

  // Build grid of dots & + symbols
  createGrid() {
    this.gridNodes = [];
    const cols = Math.ceil(this.width / this.gridSpacing) + 2;
    const rows = Math.ceil(this.height / this.gridSpacing) + 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseX = c * this.gridSpacing;
        const baseY = r * this.gridSpacing;
        
        const isPlus = (r % 3 === 0 && c % 3 === 0) || c === 0 || c === cols - 1;

        this.gridNodes.push({
          baseX: baseX,
          baseY: baseY,
          x: baseX,
          y: baseY,
          vx: 0,
          vy: 0,
          isPlus: isPlus,
          size: isPlus ? (this.width < 600 ? 3.5 : 4.5) : (this.width < 600 ? 1.5 : 1.8)
        });
      }
    }
  }

  // Create 3D Wireframe Tetrahedrons (pyramids) - Responsive Scaling
  createTetrahedrons() {
    const scale = Math.max(0.65, Math.min(this.width, this.height) / 750);

    this.tetrahedrons = [
      {
        cx: this.width * 0.72,
        cy: this.height * 0.18,
        size: 55 * scale,
        rotX: 0.3,
        rotY: 0.5,
        rotZ: 0.1,
        speedX: 0.005,
        speedY: 0.008,
        speedZ: 0.003
      },
      {
        cx: this.width * 0.25,
        cy: this.height * 0.85,
        size: 68 * scale,
        rotX: 0.8,
        rotY: 0.2,
        rotZ: 0.4,
        speedX: -0.006,
        speedY: 0.004,
        speedZ: -0.007
      },
      {
        cx: this.width * 0.88,
        cy: this.height * 0.65,
        size: 38 * scale,
        rotX: 1.2,
        rotY: 0.9,
        rotZ: 0.3,
        speedX: 0.007,
        speedY: -0.005,
        speedZ: 0.004
      }
    ];
  }

  createDustParticles() {
    this.dustParticles = [];
    const count = Math.floor((this.width * this.height) / 25000);
    for (let i = 0; i < count; i++) {
      this.dustParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  updateGrid() {
    const damp = 0.88;
    const spring = 0.06;

    for (let i = 0; i < this.gridNodes.length; i++) {
      const node = this.gridNodes[i];

      for (let s = 0; s < this.shockwaves.length; s++) {
        const sw = this.shockwaves[s];
        const sdx = node.x - sw.x;
        const sdy = node.y - sw.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        const ringDiff = Math.abs(sdist - sw.radius);

        if (ringDiff < 40) {
          const sForce = (1 - ringDiff / 40) * (sw.strength / 10);
          const sAngle = Math.atan2(sdy, sdx);
          node.vx += Math.cos(sAngle) * sForce;
          node.vy += Math.sin(sAngle) * sForce;
        }
      }

      const pdx = node.baseX - node.x;
      const pdy = node.baseY - node.y;

      node.vx += pdx * spring;
      node.vy += pdy * spring;

      node.vx *= damp;
      node.vy *= damp;

      node.x += node.vx;
      node.y += node.vy;
    }
  }

  updateShockwaves() {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = 1 - sw.radius / sw.maxRadius;

      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  updateDust() {
    for (let i = 0; i < this.dustParticles.length; i++) {
      const p = this.dustParticles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    }
  }

  // Draw smooth ambient background gradient
  drawBackground() {
    const grad = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, this.theme.bgGradient[0]);
    grad.addColorStop(0.5, this.theme.bgGradient[1]);
    grad.addColorStop(1, this.theme.bgGradient[2]);

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const radial = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.5, 0,
      this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height) * 0.6
    );
    radial.addColorStop(0, this.theme.glow);
    radial.addColorStop(1, 'transparent');
    this.ctx.fillStyle = radial;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw Grid of Dots and Pluses
  drawGrid() {
    this.ctx.save();

    for (let i = 0; i < this.gridNodes.length; i++) {
      const node = this.gridNodes[i];

      if (node.isPlus) {
        const len = this.width < 600 ? 3.5 : 4;
        this.ctx.strokeStyle = this.theme.gridPlus;
        this.ctx.lineWidth = 1.2;

        this.ctx.beginPath();
        this.ctx.moveTo(node.x - len, node.y);
        this.ctx.lineTo(node.x + len, node.y);
        this.ctx.moveTo(node.x, node.y - len);
        this.ctx.lineTo(node.x, node.y + len);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = this.theme.gridDot;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  // Draw Fluid Topographic Sine Waves
  drawWaves() {
    this.ctx.save();
    this.ctx.strokeStyle = this.theme.waveLine;
    this.ctx.lineWidth = 1.5;

    this.wavePhase += 0.015;

    for (let w = 0; w < 4; w++) {
      this.ctx.beginPath();
      const waveOffset = w * 18;

      for (let x = this.width * 0.45; x <= this.width + 50; x += 15) {
        const normX = (x - this.width * 0.45) / (this.width * 0.55);
        const sin1 = Math.sin(normX * 4 + this.wavePhase + w * 0.3) * 25;
        const sin2 = Math.cos(normX * 8 - this.wavePhase * 1.5) * 15;
        const y = this.height * 0.85 - waveOffset + sin1 + sin2 + normX * 80;

        if (x === this.width * 0.45) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
    }

    for (let w = 0; w < 3; w++) {
      this.ctx.beginPath();
      for (let x = -20; x <= this.width * 0.4; x += 12) {
        const normX = (x + 20) / (this.width * 0.42);
        const sin1 = Math.sin(normX * 5 - this.wavePhase * 1.2 + w * 0.4) * 20;
        const y = this.height * 0.12 + w * 16 + sin1 - normX * 40;

        if (x === -20) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Render 3D Wireframe Tetrahedrons (Pyramids)
  drawTetrahedrons() {
    this.ctx.save();

    this.tetrahedrons.forEach(t => {
      t.rotX += t.speedX;
      t.rotY += t.speedY;
      t.rotZ += t.speedZ;

      const centerX = t.cx;
      const centerY = t.cy;

      const rawVertices = [
        { x: 0, y: -t.size * 1.2, z: 0 },
        { x: -t.size, y: t.size * 0.8, z: -t.size * 0.8 },
        { x: t.size, y: t.size * 0.8, z: -t.size * 0.8 },
        { x: 0, y: t.size * 0.8, z: t.size }
      ];

      const rotated = rawVertices.map(v => {
        let y1 = v.y * Math.cos(t.rotX) - v.z * Math.sin(t.rotX);
        let z1 = v.y * Math.sin(t.rotX) + v.z * Math.cos(t.rotX);
        let x1 = v.x;

        let x2 = x1 * Math.cos(t.rotY) + z1 * Math.sin(t.rotY);
        let z2 = -x1 * Math.sin(t.rotY) + z1 * Math.cos(t.rotY);
        let y2 = y1;

        let x3 = x2 * Math.cos(t.rotZ) - y2 * Math.sin(t.rotZ);
        let y3 = x2 * Math.sin(t.rotZ) + y2 * Math.cos(t.rotZ);

        const fov = 400;
        const scale = fov / (fov + z2);

        return {
          x: centerX + x3 * scale,
          y: centerY + y3 * scale,
          z: z2
        };
      });

      const edges = [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1]
      ];

      this.ctx.strokeStyle = this.theme.wireframeLine;
      this.ctx.lineWidth = 1.6;
      this.ctx.beginPath();

      edges.forEach(e => {
        const p1 = rotated[e[0]];
        const p2 = rotated[e[1]];
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
      });

      this.ctx.stroke();

      this.ctx.fillStyle = this.theme.accentCyan;
      rotated.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });

    this.ctx.restore();
  }

  // Draw Concentric Circle Ring (Top Right) & Solid Circle Orb (Bottom Left)
  drawWallpaperDecorations() {
    this.ctx.save();

    const trX = this.width * 0.92;
    const trY = this.height * 0.18;
    const radius = Math.min(this.width, this.height) * 0.18;

    this.ctx.strokeStyle = this.theme.accentCyan;
    this.ctx.lineWidth = this.width < 600 ? 8 : 14;
    this.ctx.beginPath();
    this.ctx.arc(trX, trY, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(trX, trY, radius * 0.75, 0, Math.PI * 2);
    this.ctx.stroke();

    const blX = this.width * 0.1;
    const blY = this.height * 0.82;
    const orbRadius = Math.min(this.width, this.height) * 0.08;

    this.ctx.fillStyle = this.theme.accentCyan;
    this.ctx.beginPath();
    this.ctx.arc(blX, blY, orbRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Render Click Shockwaves
  drawShockwaves() {
    this.ctx.save();
    this.shockwaves.forEach(sw => {
      this.ctx.strokeStyle = this.theme.accentCyan;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    });
    this.ctx.restore();
  }

  // Draw floating dust particles
  drawDust() {
    this.ctx.save();
    this.dustParticles.forEach(p => {
      this.ctx.fillStyle = this.theme.particle;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  // Main Render Loop
  animate(timestamp) {
    if (!this.isPaused) {
      this.updateGrid();
      this.updateShockwaves();
      this.updateDust();

      this.drawBackground();
      this.drawWaves();
      this.drawGrid();
      this.drawWallpaperDecorations();
      this.drawTetrahedrons();
      this.drawShockwaves();
      this.drawDust();
    }

    requestAnimationFrame((t) => this.animate(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.bgEngine = new InteractiveBackgroundEngine();
});
