(function() {
  const stage = document.getElementById('term-stage');
  if (!stage) return;
  const linesEl = document.getElementById('term-lines');
  const input = document.getElementById('term-input');
  const statusEl = document.getElementById('term-status');
  const btnPhys = document.getElementById('btn-phys');
  const btnReset = document.getElementById('btn-reset');

  function t(key, fallback) {
    const lang = localStorage.getItem('lang') || 'ru';
    const dict = {
      ru: {
        'term.status': '$ печатай что хочешь',
        'term.status.ready': '$ жми «ОТОРВАТЬ» когда готов',
        'term.status.max': '$ максимум 8 строк, жми ОТОРВАТЬ',
        'term.status.phys': '$ хватай буквы мышкой и кидай',
        'term.reset': 'СБРОС',
        'term.tear': 'ОТОРВАТЬ',
        'term.on': 'ON'
      },
      en: {
        'term.status': '$ type what you want',
        'term.status.ready': '$ press "TEAR OFF" when ready',
        'term.status.max': '$ max 8 lines, press TEAR OFF',
        'term.status.phys': '$ grab letters and throw them',
        'term.reset': 'RESET',
        'term.tear': 'TEAR OFF',
        'term.on': 'ON'
      }
    };
    return dict[lang]?.[key] || fallback;
  }

  let letterObjects = [];
  let physicsOn = false;
  let animId = null;
  const MAX_LINES = 8;
  const LINE_HEIGHT = 28;

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function updatePhysButton() {
    const hasLines = linesEl.querySelectorAll('.term-line').length > 0;
    const hasInput = input.value.trim().length > 0;
    btnPhys.disabled = !(hasLines || hasInput);
    if (hasLines || hasInput) {
      statusEl.textContent = t('term.status.ready', '$ жми «ОТОРВАТЬ» когда готов');
      statusEl.classList.add('ok');
    } else {
      statusEl.textContent = t('term.status', '$ печатай что хочешь');
      statusEl.classList.remove('ok');
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = input.value;
      if (!text.trim()) return;
      const allLines = linesEl.querySelectorAll('.term-line');
      if (allLines.length >= MAX_LINES) {
        statusEl.textContent = t('term.status.max', '$ максимум 8 строк, жми ОТОРВАТЬ');
        return;
      }
      const lineEl = document.createElement('div');
      lineEl.className = 'term-line';
      lineEl.innerHTML = '<span class="term-prompt">> </span>' + escapeHtml(text);
      linesEl.appendChild(lineEl);
      input.value = '';
      updatePhysButton();
    } else {
      setTimeout(updatePhysButton, 0);
    }
  });

  input.addEventListener('input', updatePhysButton);

  function onMove(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const stageRect = stage.getBoundingClientRect();
    letterObjects.forEach(letter => {
      if (!letter.dragging) return;
      letter.prevMouseX = letter.lastMouseX;
      letter.prevMouseY = letter.lastMouseY;
      letter.lastMouseX = x;
      letter.lastMouseY = y;
      letter.x = x - stageRect.left - letter.offsetX;
      letter.y = y - stageRect.top - letter.offsetY;
    });
  }

  function onUp() {
    letterObjects.forEach(letter => {
      if (!letter.dragging) return;
      letter.dragging = false;
      letter.el.classList.remove('dragging');
      letter.vx = (letter.lastMouseX - letter.prevMouseX) * 0.7;
      letter.vy = (letter.lastMouseY - letter.prevMouseY) * 0.7;
      const maxV = 40;
      if (Math.abs(letter.vx) > maxV) letter.vx = Math.sign(letter.vx) * maxV;
      if (Math.abs(letter.vy) > maxV) letter.vy = Math.sign(letter.vy) * maxV;
    });
  }

  function detachDragHandlers() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }

  btnPhys.addEventListener('click', () => {
    if (physicsOn) return;
    physicsOn = true;
    btnPhys.disabled = true;
    btnPhys.textContent = t('term.on', 'ON');
    statusEl.textContent = t('term.status.phys', '$ хватай буквы мышкой и кидай');
    input.disabled = true;
    input.style.display = 'none';

    const stageRect = stage.getBoundingClientRect();
    const lineEls = Array.from(linesEl.querySelectorAll('.term-line'));
    const letterData = [];

    const measure = document.createElement('span');
    measure.style.position = 'absolute';
    measure.style.visibility = 'hidden';
    measure.style.whiteSpace = 'pre';
    measure.style.fontFamily = "'Courier New', monospace";
    measure.style.fontSize = '20px';
    measure.style.fontWeight = 'bold';
    measure.textContent = 'W';
    document.body.appendChild(measure);
    const charW = measure.getBoundingClientRect().width;
    document.body.removeChild(measure);

    lineEls.forEach(lineEl => {
      const promptEl = lineEl.querySelector('.term-prompt');
      const promptWidth = promptEl ? promptEl.getBoundingClientRect().width : 0;
      const lineRect = lineEl.getBoundingClientRect();
      const lineLeft = lineRect.left - stageRect.left;
      const lineTop = lineRect.top - stageRect.top;
      const text = lineEl.textContent.replace(/^>\s/, '');
      const startX = lineLeft + promptWidth;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === ' ') continue;
        letterData.push({ char: ch, x: startX + i * charW, y: lineTop });
      }
    });

    const inputText = input.value;
    if (inputText.trim()) {
      const inputRect = input.getBoundingClientRect();
      const startX = inputRect.left - stageRect.left;
      const startY = inputRect.top - stageRect.top;
      for (let i = 0; i < inputText.length; i++) {
        const ch = inputText[i];
        if (ch === ' ') continue;
        letterData.push({ char: ch, x: startX + i * charW, y: startY });
      }
    }

    linesEl.style.transition = 'opacity 0.15s';
    linesEl.style.opacity = '0';
    setTimeout(() => {
      if (linesEl) linesEl.innerHTML = '';
    }, 150);

    letterData.forEach((data, i) => {
      const el = document.createElement('div');
      el.className = 'term-letter';
      el.textContent = data.char;
      el.style.left = '0';
      el.style.top = '0';
      el.style.transform = `translate(${data.x}px, ${data.y}px)`;
      stage.appendChild(el);

      const letter = {
        el,
        x: data.x,
        y: data.y,
        vx: 0,
        vy: 0,
        w: charW,
        h: LINE_HEIGHT,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        prevMouseX: 0,
        prevMouseY: 0,
        angle: 0,
        va: 0,
        spawnDelay: i * 6,
        activatedAt: 0
      };

      el.addEventListener('mousedown', e => {
        if (Date.now() < letter.activatedAt + 80) return;
        e.preventDefault();
        el.classList.add('dragging');
        letter.dragging = true;
        const r = el.getBoundingClientRect();
        letter.offsetX = e.clientX - r.left;
        letter.offsetY = e.clientY - r.top;
        letter.lastMouseX = e.clientX;
        letter.lastMouseY = e.clientY;
        letter.prevMouseX = e.clientX;
        letter.prevMouseY = e.clientY;
        letter.vx = 0;
        letter.vy = 0;
        stage.appendChild(el);
      });

      el.addEventListener('touchstart', e => {
        if (Date.now() < letter.activatedAt + 80) return;
        e.preventDefault();
        el.classList.add('dragging');
        letter.dragging = true;
        const touch = e.touches[0];
        const r = el.getBoundingClientRect();
        letter.offsetX = touch.clientX - r.left;
        letter.offsetY = touch.clientY - r.top;
        letter.lastMouseX = touch.clientX;
        letter.lastMouseY = touch.clientY;
        letter.prevMouseX = touch.clientX;
        letter.prevMouseY = touch.clientY;
        letter.vx = 0;
        letter.vy = 0;
        stage.appendChild(el);
      }, { passive: false });

      letterObjects.push(letter);
    });

    letterObjects.forEach(letter => {
      setTimeout(() => {
        letter.activatedAt = Date.now();
        letter.vx = (Math.random() - 0.5) * 0.4;
        letter.vy = Math.random() * 0.2;
      }, letter.spawnDelay);
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);

    if (!animId) animId = requestAnimationFrame(loop);
  });

  const GRAVITY = 0.55;
  const AIR = 0.995;
  const BOUNCE = 0.5;
  const REST = 0.6;

  function loop() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;

    letterObjects.forEach(l => {
      if (!l.activatedAt) {
        l.el.style.transform = `translate(${l.x}px, ${l.y}px)`;
        return;
      }
      if (l.dragging) {
        l.el.style.transform = `translate(${l.x}px, ${l.y}px) rotate(${l.angle}deg)`;
        return;
      }
      l.vy += GRAVITY;
      l.vx *= AIR;
      l.vy *= AIR;
      l.x += l.vx;
      l.y += l.vy;
      l.va = l.vx * 0.02;
      l.angle += l.va;

      if (l.x < 0) { l.x = 0; l.vx = Math.abs(l.vx) * BOUNCE; }
      if (l.x + l.w > W) { l.x = W - l.w; l.vx = -Math.abs(l.vx) * BOUNCE; }
      if (l.y < 0) { l.y = 0; l.vy = Math.abs(l.vy) * BOUNCE; }
      if (l.y + l.h > H) {
        l.y = H - l.h;
        l.vy = -Math.abs(l.vy) * BOUNCE;
        if (Math.abs(l.vy) < 1) {
          l.vy = 0;
          l.vx *= REST;
        }
      }
      l.el.style.transform = `translate(${l.x}px, ${l.y}px) rotate(${l.angle}deg)`;
    });

    for (let i = 0; i < letterObjects.length; i++) {
      for (let j = i + 1; j < letterObjects.length; j++) {
        const a = letterObjects[i];
        const b = letterObjects[j];
        if (a.dragging || b.dragging) continue;
        if (!a.activatedAt || !b.activatedAt) continue;
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
        const bx = b.x + b.w / 2, by = b.y + b.h / 2;
        const dx = bx - ax, dy = by - ay;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (a.w + b.w) / 2 * 0.75;
        if (dist < minDist && dist > 0.01) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = (minDist - dist) / 2;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          const p = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (p > 0) {
            a.vx -= p * nx * 0.7;
            a.vy -= p * ny * 0.7;
            b.vx += p * nx * 0.7;
            b.vy += p * ny * 0.7;
          }
        }
      }
    }
    animId = requestAnimationFrame(loop);
  }

  btnReset.addEventListener('click', () => {
    letterObjects.forEach(l => l.el.remove());
    letterObjects = [];
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    detachDragHandlers();
    linesEl.innerHTML = '';
    linesEl.style.opacity = '1';
    physicsOn = false;
    input.disabled = false;
    input.style.display = 'block';
    input.value = '';
    input.focus();
    btnPhys.disabled = true;
    btnPhys.textContent = t('term.tear', 'ОТОРВАТЬ');
    statusEl.textContent = t('term.status', '$ печатай что хочешь');
    statusEl.classList.remove('ok');
  });

  document.getElementById('langToggle')?.addEventListener('click', () => {
    setTimeout(() => {
      if (!physicsOn) updatePhysButton();
      else statusEl.textContent = t('term.status.phys', '$ хватай буквы мышкой и кидай');
    }, 50);
  });
})();