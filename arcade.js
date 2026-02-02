/* -- Indicating what the script is for: Arcade playable games */

const GAME_SETTINGS = {
  baseWidth: 640,
  baseHeight: 360,
  maxWidth: 640
};

const activeGames = {};
const inputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  activeGame: null
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setActiveGame = (gameId) => {
  inputState.activeGame = gameId;
  Object.entries(activeGames).forEach(([key, game]) => {
    if (game && typeof game.setActive === 'function') {
      game.setActive(key === gameId);
    }
  });
};

const handleKeyState = (event, isPressed) => {
  const key = event.key.toLowerCase();
  const isArrow = event.key.startsWith('Arrow');
  const isControlKey = isArrow || ['w', 'a', 's', 'd'].includes(key);
  if (!isControlKey) return;
  if (inputState.activeGame) {
    event.preventDefault();
  }
  if (event.key === 'ArrowLeft' || key === 'a') inputState.left = isPressed;
  if (event.key === 'ArrowRight' || key === 'd') inputState.right = isPressed;
  if (event.key === 'ArrowUp' || key === 'w') inputState.up = isPressed;
  if (event.key === 'ArrowDown' || key === 's') inputState.down = isPressed;
};

const createCanvasController = (canvas) => {
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : GAME_SETTINGS.baseWidth;
    const width = Math.min(parentWidth, GAME_SETTINGS.maxWidth);
    const height = Math.round(width * (GAME_SETTINGS.baseHeight / GAME_SETTINGS.baseWidth));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height };
  };
  return { ctx, resize };
};

class BreakoutGame {
  constructor(canvas, scoreEl, livesEl, overlay) {
    this.canvas = canvas;
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.overlay = overlay;
    this.controller = createCanvasController(canvas);
    this.state = {
      running: false,
      score: 0,
      lives: 3,
      isActive: false
    };
    this.lastTime = 0;
    this.pointerActive = false;
    this.resize();
    this.reset();
    this.bindControls();
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', () => {
      this.setActive(true);
      this.pointerActive = true;
    });
    this.canvas.addEventListener('pointerup', () => {
      this.pointerActive = false;
    });
    this.canvas.addEventListener('pointerleave', () => {
      this.pointerActive = false;
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.pointerActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      this.paddle.x = clamp(x - this.paddle.width / 2, 0, this.size.width - this.paddle.width);
    });
  }

  setActive(isActive) {
    this.state.isActive = isActive;
  }

  resize() {
    this.size = this.controller.resize();
    this.paddle = {
      width: Math.max(80, this.size.width * 0.18),
      height: 12,
      x: (this.size.width - Math.max(80, this.size.width * 0.18)) / 2,
      y: this.size.height - 28
    };
    this.ball = {
      radius: 8,
      x: this.size.width / 2,
      y: this.size.height - 50,
      speed: 260,
      dx: 180,
      dy: -180
    };
    this.brickLayout = {
      rows: 5,
      cols: 8,
      padding: 10,
      offsetTop: 30,
      offsetLeft: 24,
      height: 20
    };
    this.brickLayout.width = (this.size.width - this.brickLayout.offsetLeft * 2 - this.brickLayout.padding * (this.brickLayout.cols - 1)) / this.brickLayout.cols;
    this.buildBricks();
  }

  buildBricks() {
    this.bricks = [];
    for (let row = 0; row < this.brickLayout.rows; row += 1) {
      for (let col = 0; col < this.brickLayout.cols; col += 1) {
        this.bricks.push({
          x: this.brickLayout.offsetLeft + col * (this.brickLayout.width + this.brickLayout.padding),
          y: this.brickLayout.offsetTop + row * (this.brickLayout.height + this.brickLayout.padding),
          width: this.brickLayout.width,
          height: this.brickLayout.height,
          active: true
        });
      }
    }
  }

  updateScore() {
    this.scoreEl.textContent = this.state.score;
    this.livesEl.textContent = this.state.lives;
  }

  start() {
    if (this.state.running) return;
    this.state.running = true;
    this.overlay.classList.add('hidden');
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  pause() {
    this.state.running = false;
    this.overlay.textContent = 'Paused';
    this.overlay.classList.remove('hidden');
  }

  reset() {
    this.state.running = false;
    this.state.score = 0;
    this.state.lives = 3;
    this.ball.x = this.size.width / 2;
    this.ball.y = this.size.height - 50;
    this.ball.dx = 180;
    this.ball.dy = -180;
    this.paddle.x = (this.size.width - this.paddle.width) / 2;
    this.buildBricks();
    this.overlay.textContent = 'Press Start to launch';
    this.overlay.classList.remove('hidden');
    this.updateScore();
    this.draw();
  }

  loop(timestamp) {
    if (!this.state.running) return;
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.02);
    this.lastTime = timestamp;
    this.update(delta);
    this.draw();
    requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
  }

  update(delta) {
    const speedX = this.ball.dx;
    const speedY = this.ball.dy;
    this.ball.x += speedX * delta;
    this.ball.y += speedY * delta;

    if (this.state.isActive && inputState.left) {
      this.paddle.x -= 360 * delta;
    }
    if (this.state.isActive && inputState.right) {
      this.paddle.x += 360 * delta;
    }
    this.paddle.x = clamp(this.paddle.x, 0, this.size.width - this.paddle.width);

    if (this.ball.x <= this.ball.radius || this.ball.x >= this.size.width - this.ball.radius) {
      this.ball.dx *= -1;
    }
    if (this.ball.y <= this.ball.radius) {
      this.ball.dy *= -1;
    }

    if (this.ball.y + this.ball.radius >= this.paddle.y &&
        this.ball.x >= this.paddle.x &&
        this.ball.x <= this.paddle.x + this.paddle.width &&
        this.ball.dy > 0) {
      const hitPoint = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
      this.ball.dx = hitPoint * this.ball.speed;
      this.ball.dy = -Math.abs(this.ball.dy);
    }

    for (const brick of this.bricks) {
      if (!brick.active) continue;
      if (this.ball.x >= brick.x &&
          this.ball.x <= brick.x + brick.width &&
          this.ball.y - this.ball.radius <= brick.y + brick.height &&
          this.ball.y + this.ball.radius >= brick.y) {
        brick.active = false;
        this.ball.dy *= -1;
        this.state.score += 10;
        this.updateScore();
        break;
      }
    }

    if (this.bricks.every((brick) => !brick.active)) {
      this.overlay.textContent = 'Victory! Press Start to replay';
      this.state.running = false;
      this.overlay.classList.remove('hidden');
    }

    if (this.ball.y > this.size.height + this.ball.radius) {
      this.state.lives -= 1;
      this.updateScore();
      if (this.state.lives <= 0) {
        this.overlay.textContent = 'Game Over. Press Start';
        this.state.running = false;
        this.overlay.classList.remove('hidden');
      } else {
        this.ball.x = this.size.width / 2;
        this.ball.y = this.size.height - 50;
        this.ball.dy = -Math.abs(this.ball.dy);
      }
    }
  }

  draw() {
    const { ctx } = this.controller;
    ctx.clearRect(0, 0, this.size.width, this.size.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.size.width, this.size.height);

    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22d3ee'];
    this.bricks.forEach((brick, index) => {
      if (!brick.active) return;
      ctx.fillStyle = palette[index % palette.length];
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    });
  }
}

class DodgerGame {
  constructor(canvas, scoreEl, livesEl, overlay) {
    this.canvas = canvas;
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.overlay = overlay;
    this.controller = createCanvasController(canvas);
    this.state = {
      running: false,
      score: 0,
      lives: 3,
      isActive: false
    };
    this.lastTime = 0;
    this.spawnTimer = 0;
    this.resize();
    this.reset();
    this.bindControls();
  }

  bindControls() {
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.state.running) return;
      this.setActive(true);
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      this.player.x = clamp(x, this.player.radius, this.size.width - this.player.radius);
    });
  }

  setActive(isActive) {
    this.state.isActive = isActive;
  }

  resize() {
    this.size = this.controller.resize();
    this.player = {
      x: this.size.width / 2,
      y: this.size.height - 50,
      radius: 14,
      speed: 260
    };
  }

  updateScore() {
    this.scoreEl.textContent = this.state.score;
    this.livesEl.textContent = this.state.lives;
  }

  start() {
    if (this.state.running) return;
    this.state.running = true;
    this.overlay.classList.add('hidden');
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  pause() {
    this.state.running = false;
    this.overlay.textContent = 'Paused';
    this.overlay.classList.remove('hidden');
  }

  reset() {
    this.state.running = false;
    this.state.score = 0;
    this.state.lives = 3;
    this.asteroids = [];
    this.spawnTimer = 0;
    this.player.x = this.size.width / 2;
    this.player.y = this.size.height - 50;
    this.overlay.textContent = 'Press Start to deploy';
    this.overlay.classList.remove('hidden');
    this.updateScore();
    this.draw();
  }

  loop(timestamp) {
    if (!this.state.running) return;
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.02);
    this.lastTime = timestamp;
    this.update(delta);
    this.draw();
    requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
  }

  update(delta) {
    if (this.state.isActive && inputState.left) this.player.x -= this.player.speed * delta;
    if (this.state.isActive && inputState.right) this.player.x += this.player.speed * delta;
    if (this.state.isActive && inputState.up) this.player.y -= this.player.speed * delta;
    if (this.state.isActive && inputState.down) this.player.y += this.player.speed * delta;

    this.player.x = clamp(this.player.x, this.player.radius, this.size.width - this.player.radius);
    this.player.y = clamp(this.player.y, this.player.radius, this.size.height - this.player.radius);

    this.spawnTimer += delta;
    const spawnInterval = Math.max(0.35, 1.1 - this.state.score / 500);
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnAsteroid();
    }

    this.asteroids.forEach((asteroid) => {
      asteroid.y += asteroid.speed * delta;
    });

    this.asteroids = this.asteroids.filter((asteroid) => asteroid.y < this.size.height + asteroid.radius);

    for (const asteroid of this.asteroids) {
      const dx = asteroid.x - this.player.x;
      const dy = asteroid.y - this.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance < asteroid.radius + this.player.radius) {
        this.state.lives -= 1;
        this.updateScore();
        asteroid.y = this.size.height + asteroid.radius;
        if (this.state.lives <= 0) {
          this.overlay.textContent = 'Game Over. Press Start';
          this.state.running = false;
          this.overlay.classList.remove('hidden');
        }
      }
    }

    this.state.score += Math.floor(60 * delta);
    this.updateScore();
  }

  spawnAsteroid() {
    const radius = 10 + Math.random() * 10;
    this.asteroids.push({
      x: radius + Math.random() * (this.size.width - radius * 2),
      y: -radius,
      radius,
      speed: 120 + Math.random() * 80 + this.state.score * 0.05
    });
  }

  draw() {
    const { ctx } = this.controller;
    ctx.clearRect(0, 0, this.size.width, this.size.height);
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, this.size.width, this.size.height);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    this.asteroids.forEach((asteroid) => {
      ctx.beginPath();
      ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 12]);
    ctx.beginPath();
    ctx.moveTo(0, this.size.height * 0.5);
    ctx.lineTo(this.size.width, this.size.height * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

const setupArcade = () => {
  const breakoutCanvas = document.getElementById('breakout-canvas');
  const dodgerCanvas = document.getElementById('dodger-canvas');
  if (!breakoutCanvas || !dodgerCanvas) return;

  activeGames.breakout = new BreakoutGame(
    breakoutCanvas,
    document.getElementById('breakout-score'),
    document.getElementById('breakout-lives'),
    document.querySelector('[data-overlay="breakout"]')
  );

  activeGames.dodger = new DodgerGame(
    dodgerCanvas,
    document.getElementById('dodger-score'),
    document.getElementById('dodger-lives'),
    document.querySelector('[data-overlay="dodger"]')
  );

  window.addEventListener('keydown', (event) => handleKeyState(event, true));
  window.addEventListener('keyup', (event) => handleKeyState(event, false));

  breakoutCanvas.addEventListener('pointerdown', () => setActiveGame('breakout'));
  dodgerCanvas.addEventListener('pointerdown', () => setActiveGame('dodger'));

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      const target = button.getAttribute('data-target');
      const game = activeGames[target];
      if (!game) return;

      if (action === 'start') {
        if (!game.state.running) {
          if (game.overlay.textContent.includes('Game Over') || game.overlay.textContent.includes('Victory')) {
            game.reset();
          }
          setActiveGame(target);
          game.start();
        }
      }
      if (action === 'pause') game.pause();
      if (action === 'reset') game.reset();
    });
  });

  window.addEventListener('resize', () => {
    Object.values(activeGames).forEach((game) => {
      game.resize();
      game.draw();
    });
  });
};

document.addEventListener('DOMContentLoaded', setupArcade);
