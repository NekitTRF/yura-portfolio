(function() { // FIXME: переписать
  'use strict';

  const MAX_PARTICLES = 120;
  const PARTICLES_PER_CLICK = 1;
  const BASE_DENSITY = 18000;
  const CLICK_MAX = 200;
  const CONNECT_DIST = 130;
  const MOUSE_RADIUS = 160;

  const canvas = document.createElement('canvas');
  canvas.id = 'particles-global';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    opacity: 0.85;
  `;
  document.body.appendChild(canvas);

  document.querySelectorAll('header, main, section, footer, .hero, .section').forEach(el => {
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
      el.style.zIndex = '1';
    }
  });

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w = 0;
  let h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const mouse = { x: -9999, y: -9999, active: false };

  let paused = false;
  let lastTime = performance.now();

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) lastTime = performance.now();
  });

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle(x, y, opts = {}) {
    return {
      x: x ?? Math.random() * w,
      y: y ?? Math.random() * h,
      vx: opts.vx ?? (Math.random() - 0.5) * 0.35,
      vy: opts.vy ?? (Math.random() - 0.5) * 0.35,
      r: opts.r ?? (Math.random() * 1.6 + 0.6),
      born: performance.now(),
      life: opts.life ?? Infinity,
      isClick: opts.isClick ?? false,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.03
    };
  }

  function fillParticles() {
    particles = [];
    const target = Math.min(MAX_PARTICLES, Math.floor((w * h) / BASE_DENSITY));
    for (let i = 0; i < target; i++) particles.push(makeParticle());
  }

  const IGNORE_SELECTOR = [
    'a', 'button', 'input', 'textarea',
    '.terminal', '.faq-item', '.review', '.work',
    '.story-card', '.nav-item', '.snake-wrap',
    '.gallery-item', '.lightbox', '.settings-panel',
    '.opt', '.toggle', '.term-btn', '.snake-btn',
    '.carousel-btn', '.icon-btn', '.burger'
  ].join(', ');

  document.addEventListener('click', (e) => {
    if (e.target.closest(IGNORE_SELECTOR)) return;

    if (particles.length >= CLICK_MAX) {
      const idx = particles.findIndex(p => p.isClick);
      if (idx !== -1) particles.splice(idx, 1);
      else return;
    }

    for (let i = 0; i < PARTICLES_PER_CLICK; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 0.8;
      particles.push(makeParticle(e.clientX, e.clientY, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 2 + 1.2,
        life: 4000 + Math.random() * 2000,
        isClick: true
      }));
    }
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  function loop(now) {
    requestAnimationFrame(loop);

    if (paused) return;

    const dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;

    ctx.clearRect(0, 0, w, h);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.life !== Infinity && now - p.born > p.life) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > w) { p.x = w; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > h) { p.y = h; p.vy *= -1; }

      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.15;
          p.x += (dx / dist) * force * dt;
          p.y += (dy / dist) * force * dt;
        }
      }

      if (p.isClick) {
        p.vx *= 0.985;
        p.vy *= 0.985;
      }

      p.twinkle += p.twinkleSpeed * dt;
    }

    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONNECT_DIST * CONNECT_DIST) {
          const d = Math.sqrt(d2);
          const alpha = 0.12 * (1 - d / CONNECT_DIST);
          ctx.strokeStyle = `rgba(255, 140, 0, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const twinkle = 0.6 + Math.sin(p.twinkle) * 0.4;
      const alpha = p.isClick ? twinkle : 0.7 * twinkle;

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      gradient.addColorStop(0, `rgba(255, 180, 60, ${alpha})`);
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 215, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize();
  fillParticles();
  requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      const clicks = particles.filter(p => p.isClick);
      fillParticles();
      particles = particles.concat(clicks).slice(0, CLICK_MAX);
    }, 250);
  });
})();