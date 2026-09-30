(function() {
  const canvas = document.getElementById('snakeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('snakeScore');
  const btnStart = document.getElementById('snakeStart');
  const btnPause = document.getElementById('snakePause');

  const CELL = 24;
  const COLS = 10;
  const ROWS = 10;
  canvas.width = CELL * COLS;
  canvas.height = CELL * ROWS;

  let snake, dir, nextDir, food, score, speed, timer, running, paused, started;

  function reset() {
    snake = [{ x: 5, y: 5 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = 250;
    running = true;
    paused = true;
    started = false;
    scoreEl.textContent = '0';
    placeFood();
    clearInterval(timer);
    timer = null;
    draw();
    drawOverlay();
    if (btnPause) btnPause.textContent = '▶';
  }

  function start() {
    started = true;
    paused = false;
    running = true;
    clearInterval(timer);
    timer = setInterval(loop, speed);
    if (btnPause) btnPause.textContent = '⏸';
  }

  function placeFood() {
    let attempts = 0;
    while (attempts < 200) {
      food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      if (!snake.some(s => s.x === food.x && s.y === food.y)) break;
      attempts++;
    }
  }

  function loop() {
    if (paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      placeFood();
      if (score % 5 === 0 && speed > 100) {
        speed -= 10;
        clearInterval(timer);
        timer = setInterval(loop, speed);
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = '#14161f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,140,0,0.08)';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff8c00';
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#ff8c00' : `rgba(255,140,0,${Math.max(1 - i * 0.02, 0.3)})`;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });

    ctx.shadowBlur = 0;
  }

  function drawOverlay() {
    ctx.fillStyle = 'rgba(20,22,31,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff8c00';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    const lang = localStorage.getItem('lang') || 'ru';
    ctx.fillText(lang === 'ru' ? '▶ Нажми Play' : '▶ Press Play', canvas.width / 2, canvas.height / 2);
  }

  function gameOver() {
    clearInterval(timer);
    timer = null;
    running = false;
    paused = true;
    ctx.fillStyle = 'rgba(20,22,31,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff8c00';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = '#a0aec0';
    ctx.font = '14px "Courier New", monospace';
    const lang = localStorage.getItem('lang') || 'ru';
    ctx.fillText(lang === 'ru' ? 'Счёт: ' + score : 'Score: ' + score, canvas.width / 2, canvas.height / 2 + 24);
    if (btnPause) btnPause.textContent = '▶';
  }

  document.addEventListener('keydown', (e) => {
    if (!running) return;

    const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrows.includes(e.key)) e.preventDefault();

    if (paused && arrows.includes(e.key)) {
      start();
    }

    if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
  });

  if (btnStart) btnStart.addEventListener('click', reset);

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (!running || !started) {
        start();
        return;
      }
      if (paused) {
        start();
      } else {
        paused = true;
        clearInterval(timer);
        timer = null;
        btnPause.textContent = '▶';
      }
    });
  }

  reset();
})();