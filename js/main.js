document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const path = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');

    const link = item.querySelector('.nav-link') || item.querySelector('a') || item;
    const href = link.getAttribute('href');

    if (href && href === path) {
      item.classList.add('active');
      return;
    }

    if (path.startsWith('project-') && href === 'projects.html') {
      item.classList.add('active');
      return;
    }

    if (path.startsWith('story-') && href === 'stories.html') {
      item.classList.add('active');
      return;
    }

    if (path.startsWith('project-') && item.querySelector('a[href="projects.html"]')) {
      item.classList.add('active');
    }

    if (path.startsWith('story-') && item.querySelector('a[href="stories.html"]')) {
      item.classList.add('active');
    }
  });

  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });

  const track = document.querySelector('.reviews-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  if (track && prevBtn && nextBtn) {
    let offset = 0;
    const card = track.querySelector('.review');
    if (card) {
      const step = card.offsetWidth + 20;
      const maxOffset = track.scrollWidth - track.parentElement.offsetWidth;

      const update = () => {
        track.style.transform = `translateX(-${offset}px)`;
        prevBtn.disabled = offset <= 0;
        nextBtn.disabled = offset >= maxOffset;
      };

      nextBtn.addEventListener('click', () => {
        offset = Math.min(offset + step, maxOffset);
        update();
      });
      prevBtn.addEventListener('click', () => {
        offset = Math.max(offset - step, 0);
        update();
      });
      update();

      window.addEventListener('resize', () => {
        offset = 0;
        const newMax = track.scrollWidth - track.parentElement.offsetWidth;
        nextBtn.disabled = newMax <= 0;
        update();
      });
    }
  }
});