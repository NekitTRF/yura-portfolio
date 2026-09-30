(function() {
  'use strict';

  const preloader = document.getElementById('preloader');
  if (!preloader) return;

    if (sessionStorage.getItem('preloaderShown') === 'yes') {
    preloader.remove();
    return;
  }
  sessionStorage.setItem('preloaderShown', 'yes');

  const fill = document.getElementById('preloaderFill');
  const status = document.getElementById('preloaderStatus');

  const lang = localStorage.getItem('lang') || 'ru';
  const messages = {
    ru: ['Инициализация...', 'Загрузка частиц...', 'Загрузка терминала...', 'Почти готово...', 'Готово!'],
    en: ['Initializing...', 'Loading particles...', 'Loading terminal...', 'Almost there...', 'Ready!']
  };
  const list = messages[lang] || messages.ru;

  let progress = 0;
  let step = 0;
  let hidden = false;
  let interval = null;

  function hidePreloader() {
    if (hidden) return;
    if (!preloader.isConnected) return;
    hidden = true;

    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    preloader.classList.add('hidden');
    setTimeout(() => {
      if (preloader.isConnected) preloader.remove();
    }, 600);
  }

  interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 100) progress = 100;

    if (fill) fill.style.width = progress + '%';

    const newStep = Math.min(Math.floor(progress / 25), list.length - 1);
    if (newStep !== step) {
      step = newStep;
      if (status) status.textContent = list[step];
    }

    if (progress >= 100) {
      clearInterval(interval);
      interval = null;
      setTimeout(hidePreloader, 300);
    }
  }, 120);

  window.addEventListener('load', () => {
    if (progress < 80) progress = 80;
  });

  setTimeout(hidePreloader, 5000);
})();