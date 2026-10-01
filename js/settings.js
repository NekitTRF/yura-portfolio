(function() {
  const ARROW_SVG = `
<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 2 L2 22 L8 16 L12 26 L16 24 L12 14 L20 14 Z"
        fill="#ff8c00" stroke="#14161f" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

  let cursorElements = [];
  let animId = null;
  let handlers = [];
  let currentCursor = localStorage.getItem('cursorVariant') || '1';

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  const hoverTargets = 'a, button, .work, .story-card, .stat, .review, .gallery-item, .nav-item, .icon-btn, .card, .faq-q';

  const panel = document.getElementById('settingsPanel');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeBtn = document.getElementById('closeSettings');
document.addEventListener('mouseleave', () => {
  document.querySelectorAll('.cursor-1-dot, .cursor-1-ring, .cursor-2-arrow, .cursor-3-glow, .cursor-3-core, .cursor-4-cross, .cursor-4-center').forEach(el => {
    el.classList.remove('hover');
  });
});

  if (settingsBtn && panel) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      settingsBtn.classList.toggle('active', panel.classList.contains('open'));
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        settingsBtn.classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#settingsPanel') && !e.target.closest('#settingsBtn')) {
        if (panel.classList.contains('open')) {
          panel.classList.remove('open');
          settingsBtn.classList.remove('active');
        }
      }
    });
  }

  function resetCursor() {
    cursorElements.forEach(el => el.remove());
    cursorElements = [];
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    handlers = [];
    document.body.classList.remove('cursor-active');
  }

function bindHover(onOver, onOut) {
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);
  handlers.push(
    { el: document, type: 'mouseover', fn: onOver },
    { el: document, type: 'mouseout', fn: onOut }
  );
}

  function createCursor(variant) {
    resetCursor();
    if (variant === 'off') return;
    document.body.classList.add('cursor-active');

    if (variant === '1') {
      const dot = document.createElement('div');
      dot.className = 'cursor-1-dot';
      document.body.appendChild(dot);

      const ring = document.createElement('div');
      ring.className = 'cursor-1-ring';
      document.body.appendChild(ring);

      cursorElements.push(dot, ring);

      let dx = mx, dy = my, rx = mx, ry = my;

      const onOver = e => {
        if (e.target.closest(hoverTargets)) {
          dot.classList.add('hover');
          ring.classList.add('hover');
        }
      };
      const onOut = e => {
        if (e.target.closest(hoverTargets)) {
          dot.classList.remove('hover');
          ring.classList.remove('hover');
        }
      };
      bindHover(onOver, onOut);

      function loop() {
        dx += (mx - dx) * 1.0;
        dy += (my - dy) * 1.0;
        rx += (mx - rx) * 0.31;
        ry += (my - ry) * 0.31;
        dot.style.left = dx + 'px';
        dot.style.top = dy + 'px';
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        animId = requestAnimationFrame(loop);
      }
      loop();
    }

    if (variant === '2') {
      const arrow = document.createElement('div');
      arrow.className = 'cursor-2-arrow';
      arrow.innerHTML = ARROW_SVG;
      document.body.appendChild(arrow);
      cursorElements.push(arrow);

      let ax = mx, ay = my;

      const onOver = e => {
        if (e.target.closest(hoverTargets)) arrow.classList.add('hover');
      };
      const onOut = e => {
        if (e.target.closest(hoverTargets)) arrow.classList.remove('hover');
      };
      bindHover(onOver, onOut);

      function loop() {
        ax += (mx - ax) * 0.9;
        ay += (my - ay) * 0.9;
        arrow.style.left = ax + 'px';
        arrow.style.top = ay + 'px';
        animId = requestAnimationFrame(loop);
      }
      loop();
    }

    if (variant === '3') {
      const glow = document.createElement('div');
      glow.className = 'cursor-3-glow';
      document.body.appendChild(glow);

      const core = document.createElement('div');
      core.className = 'cursor-3-core';
      document.body.appendChild(core);

      cursorElements.push(glow, core);

      let gx = mx, gy = my, cx = mx, cy = my;

      const onOver = e => {
        if (e.target.closest(hoverTargets)) {
          glow.classList.add('hover');
          core.classList.add('hover');
        }
      };
      const onOut = e => {
        if (e.target.closest(hoverTargets)) {
          glow.classList.remove('hover');
          core.classList.remove('hover');
        }
      };
      bindHover([glow, core], onOver, onOut);

      function loop() {
        gx += (mx - gx) * 0.25;
        gy += (my - gy) * 0.25;
        cx += (mx - cx) * 0.9;
        cy += (my - cy) * 0.9;
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';
        core.style.left = cx + 'px';
        core.style.top = cy + 'px';
        animId = requestAnimationFrame(loop);
      }
      loop();
    }

    if (variant === '4') {
      const cross = document.createElement('div');
      cross.className = 'cursor-4-cross';
      document.body.appendChild(cross);

      const center = document.createElement('div');
      center.className = 'cursor-4-center';
      document.body.appendChild(center);

      cursorElements.push(cross, center);

      let cx = mx, cy = my;

      const onOver = e => {
        if (e.target.closest(hoverTargets)) cross.classList.add('hover');
      };
      const onOut = e => {
        if (e.target.closest(hoverTargets)) cross.classList.remove('hover');
      };
      bindHover([cross], onOver, onOut);

      function loop() {
        cx += (mx - cx) * 0.8;
        cy += (my - cy) * 0.8;
        cross.style.left = cx + 'px';
        cross.style.top = cy + 'px';
        center.style.left = cx + 'px';
        center.style.top = cy + 'px';
        animId = requestAnimationFrame(loop);
      }
      loop();
    }
  }

document.querySelectorAll('.opt[data-cursor]').forEach(btn => {
  btn.classList.toggle('active', btn.dataset.cursor === currentCursor);
  btn.addEventListener('click', () => {
    document.querySelectorAll('.opt[data-cursor]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCursor = btn.dataset.cursor;
    localStorage.setItem('cursorVariant', currentCursor);
    createCursor(currentCursor);
  });
});

  document.querySelectorAll('.toggle[data-toggle]').forEach(toggle => {
    const key = 'fx_' + toggle.dataset.toggle;
    const stored = localStorage.getItem(key);
    if (stored === 'off') toggle.classList.remove('on');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
      const isOn = toggle.classList.contains('on');
      localStorage.setItem(key, isOn ? 'on' : 'off');
      if (toggle.dataset.toggle === 'glow') {
        document.body.classList.toggle('no-glow', !isOn);
      }
    });
    if (toggle.dataset.toggle === 'glow' && stored === 'off') {
      document.body.classList.add('no-glow');
    }
  });

  const isTouch = 'ontouchstart' in window || window.matchMedia('(max-width: 900px)').matches;
  if (!isTouch) createCursor(currentCursor);
})();