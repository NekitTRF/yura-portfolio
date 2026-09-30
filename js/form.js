(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  if (!btn || !status) return;

  function t(key, fallback) {
    const lang = localStorage.getItem('lang') || 'ru';
    const dict = {
      ru: {
        'form.sending': 'Отправка...',
        'form.success': '✓ Спасибо! Я свяжусь с вами.',
        'form.error': '✗ Ошибка. Попробуйте ещё раз или напишите в Telegram.'
      },
      en: {
        'form.sending': 'Sending...',
        'form.success': '✓ Thanks! I will get back to you.',
        'form.error': '✗ Error. Try again or message me on Telegram.'
      }
    };
    return dict[lang]?.[key] || fallback;
  }

  const originalText = btn.textContent;
  let statusTimer = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = t('form.sending', 'Отправка...');
    status.textContent = '';
    status.className = 'form-status loading';

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.textContent = t('form.success', '✓ Спасибо! Я свяжусь с вами.');
        status.className = 'form-status success';
        form.reset();
      } else {
        status.textContent = t('form.error', '✗ Ошибка. Попробуйте ещё раз.');
        status.className = 'form-status error';
      }
    } catch (error) {
      status.textContent = t('form.error', '✗ Ошибка. Попробуйте ещё раз.');
      status.className = 'form-status error';
    }

    btn.disabled = false;
    btn.textContent = originalText;

    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      status.textContent = '';
      status.className = 'form-status';
    }, 5000);
  });

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      if (!btn.disabled) {
        btn.textContent = document.querySelector('[data-i18n="form.send"]')?.textContent || originalText;
      }
    });
  }
})();