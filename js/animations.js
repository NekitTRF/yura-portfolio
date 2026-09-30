(function() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px 60px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); 

  function animateNumber(el, start, end, duration, suffix = '') {
    const startTime = performance.now();
    function frame(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(start + (end - start) * eased);
      el.textContent = value + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(fill => {
          const target = fill.dataset.percent || fill.dataset.level || 0;
          fill.style.width = target + '%';
        });
        entry.target.querySelectorAll('.skill-percent').forEach(p => {
          const target = parseInt(p.dataset.target || 0, 10);
          animateNumber(p, 0, target, 2250, '%');
        });
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });// тут косяк был, НЕ ТРОГАТЬ!!!!

  document.querySelectorAll('.skills-grid').forEach(el => skillsObserver.observe(el));

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(num => {
          const text = num.textContent.trim();
          const match = text.match(/(\d+)/);
          if (match) {
            const target = parseInt(match[1], 10);
            const suffix = text.replace(/\d+/, '');
            animateNumber(num, 0, target, 2700, suffix);
          }
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stats').forEach(el => statsObserver.observe(el));

  const nwObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.nw-fill');
        const percentEl = entry.target.querySelector('.nw-percent');
        if (fill) {
          const target = parseInt(fill.dataset.percent || 60, 10);
          fill.style.width = target + '%';
          if (percentEl) animateNumber(percentEl, 0, target, 3000, '%');
        }
        nwObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.now-working').forEach(el => nwObserver.observe(el));
})();