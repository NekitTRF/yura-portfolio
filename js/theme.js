(function() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const themes = ['dark', 'light', 'auto'];
  const icons = { dark: '☾', light: '☀', auto: '◐' };

function getStored() {
  return localStorage.getItem('theme') || 'auto';
}

function apply(theme) {
  let actual = theme;
  if (theme === 'auto') {
    actual = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', actual);
  btn.textContent = icons[theme];
  const lang = localStorage.getItem('lang') || 'ru';
  btn.title = lang === 'ru' ? 'Тема: ' + theme : 'Theme: ' + theme;
  localStorage.setItem('theme', theme);
}

  btn.addEventListener('click', () => {
    const current = getStored();
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    apply(next);
  });

  apply(getStored());

  const mq = window.matchMedia('(prefers-color-scheme: light)');
  const handler = () => {
    if (getStored() === 'auto') apply('auto');
  };

  if (mq.addEventListener) {
    mq.addEventListener('change', handler);
  } else if (mq.addListener) {
    mq.addListener(handler);
  }
})();