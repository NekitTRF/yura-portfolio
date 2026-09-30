(function() {
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = el.getAttribute('data-copy');
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);

        const lang = localStorage.getItem('lang') || 'ru';
        const copiedText = lang === 'ru' ? '✓ Скопировано!' : '✓ Copied!';

        const span = el.querySelector('.contact-info span');

        if (span) {
          const original = span.textContent;
          const originalColor = span.style.color;
          span.textContent = copiedText;
          span.style.color = 'var(--accent)';
          setTimeout(() => {
            span.textContent = original;
            span.style.color = originalColor;
          }, 1500);
        } else {
          const original = el.textContent;
          el.textContent = copiedText;
          setTimeout(() => {
            el.textContent = original;
          }, 1500);
        }
      } catch (err) {
        const lang = localStorage.getItem('lang') || 'ru';
        alert(lang === 'ru' ? 'Не удалось скопировать' : 'Failed to copy');
      }
    });
  });
})();