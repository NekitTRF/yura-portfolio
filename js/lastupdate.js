(function() {
  const el = document.getElementById('lastUpdate');
  if (!el) return;

  fetch('https://api.github.com/repos/NekitTRF/yura-portfolio/commits?per_page=1')
    .then(res => res.json())
    .then(data => {
      if (!data || !data[0]) return;
      const date = new Date(data[0].commit.committer.date);
      const lang = localStorage.getItem('lang') || 'ru';
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let text;
      if (lang === 'ru') {
        if (diffHours < 1) text = 'только что';
        else if (diffHours < 24) text = diffHours + ' ч. назад';
        else if (diffDays === 1) text = 'вчера';
        else if (diffDays < 30) text = diffDays + ' дн. назад';
        else text = date.toLocaleDateString('ru-RU');
      } else {
        if (diffHours < 1) text = 'just now';
        else if (diffHours < 24) text = diffHours + 'h ago';
        else if (diffDays === 1) text = 'yesterday';
        else if (diffDays < 30) text = diffDays + 'd ago';
        else text = date.toLocaleDateString('en-US');
      }
      el.textContent = text;
    })
    .catch(() => {
      el.textContent = '';
    });
})();