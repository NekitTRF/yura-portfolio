(function() {
  if (localStorage.getItem('fx_glow') === 'off') return;

  const selector = '.card, .work, .stat, .story-card, .review';

  document.querySelectorAll(selector).forEach(card => {
    card.style.position = 'relative';

    const glow = document.createElement('div');
    glow.className = 'card-glow';
    glow.style.cssText = `
      position: absolute; inset: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255,140,0,0.15), transparent 60%);
      opacity: 0; transition: opacity 0.3s; pointer-events: none;
      border-radius: inherit;
    `;
    card.appendChild(glow);

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,140,0,0.18), transparent 55%)`;
      glow.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  });
})();