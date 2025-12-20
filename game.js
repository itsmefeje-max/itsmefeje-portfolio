/* COSMIC FLAP GAME ENGINE (PHYSICS UPDATE) */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game Variables
let frames = 0;
let score = 0;
let gamespeed = 1.5; 
let isGameOver = false;
let isPlaying = false;
let animationId = null;

// Physics Configuration
const gravity = 0.18;      
const pipeGap = 160;       
const jumpStrength = 5.2;  // Increased for Taller Jump

// Set Internal Resolution
canvas.width = 400;
canvas.height = 600;

// User Data
const username = localStorage.getItem('flappy_username') || "Anonymous";
let highScore = getSecureScore(); 

// --- BIRD --- //
class Bird {
  constructor() {
    this.x = 50;
    this.y = 200;
    this.velocity = 0;
    this.width = 24;
    this.height = 24;
  }

  draw() {
    ctx.fillStyle = '#6366f1';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#6366f1';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }

  update() {
    this.velocity += gravity;
    this.y += this.velocity;

    // Floor
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      gameOver();
    }
    // Ceiling
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  flap() {
    this.velocity = -jumpStrength;
  }
}

// --- PIPES --- //
const pipes = [];
class Pipe {
  constructor() {
    this.x = canvas.width;
    this.width = 52;
    this.passed = false;
    
    // Logic to ensure pipes are always passable
    const minHeight = 50;
    const maxTop = canvas.height - pipeGap - minHeight;
    
    this.topHeight = Math.floor(Math.random() * (maxTop - minHeight + 1)) + minHeight;
    this.bottomY = this.topHeight + pipeGap;
    this.bottomHeight = canvas.height - this.bottomY;
  }

  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;

    // Top
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);

    // Bottom
    ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
    ctx.strokeRect(this.x, this.bottomY, this.width, this.bottomHeight);
  }

  update() {
    this.x -= gamespeed;

    // Collision
    if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
      if (bird.y < this.topHeight || bird.y + bird.height > this.bottomY) {
        gameOver();
      }
    }

    // Score
    if (this.x + this.width < bird.x && !this.passed) {
      score++;
      updateScoreDisplay();
      this.passed = true;
      // Difficulty Scaling
      if (score % 10 === 0) gamespeed += 0.2; 
    }
  }
}

const bird = new Bird();

// --- CORE FUNCTIONS --- //

function initGame() {
  if (animationId) cancelAnimationFrame(animationId);
  
  bird.y = 200;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  gamespeed = 1.5; 
  frames = 0;
  isGameOver = false;
  isPlaying = true;
  
  updateScoreDisplay();
  
  document.getElementById('game-overlay').classList.remove('active');
  document.getElementById('start-overlay').classList.remove('active');
  
  animate();
}

function animate() {
  if (!isPlaying) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  bird.update();
  bird.draw();

  // Pipe Spawning (DISTANCE INCREASED)
  // 230 frames = further distance between blocks
  if (frames % 230 === 0) {
    pipes.push(new Pipe());
  }

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].update();
    pipes[i].draw();

    if (pipes[i].x + pipes[i].width < 0) {
      pipes.shift();
      i--;
    }
  }

  frames++;
  animationId = requestAnimationFrame(animate);
}

function drawBackground() {
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for(let i=0; i<15; i++) {
     let x = (frames * 0.2 + i * 80) % canvas.width;
     let y = (i * 45) % canvas.height;
     ctx.fillRect(x, y, 2, 2);
  }
}

function gameOver() {
  isPlaying = false;
  isGameOver = true;
  cancelAnimationFrame(animationId);
  
  saveScore(score);
  
  document.getElementById('final-score-display').innerText = `Score: ${score}`;
  document.getElementById('game-overlay').classList.add('active');
}

// --- CONTROLS --- //

function handleInput() {
  if (isGameOver) {
    initGame();
  } else if (!isPlaying) {
    initGame();
  } else {
    bird.flap();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    handleInput();
  }
});

canvas.addEventListener('click', (e) => {
  e.preventDefault();
  handleInput();
});

document.getElementById('restart-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  if (isGameOver) initGame();
});

// --- LEADERBOARD & DATA --- //

function saveScore(newScore) {
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem('flappy_leaderboard')) || [];
  } catch (e) {
    leaderboard = [];
  }

  const existingIndex = leaderboard.findIndex(entry => entry.name === username);

  if (existingIndex !== -1) {
    if (newScore > leaderboard[existingIndex].score) {
      leaderboard[existingIndex].score = newScore;
      leaderboard[existingIndex].date = new Date().toLocaleDateString();
    }
  } else {
    leaderboard.push({ name: username, score: newScore, date: new Date().toLocaleDateString() });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  
  localStorage.setItem('flappy_leaderboard', JSON.stringify(leaderboard));

  if (newScore > highScore) {
    highScore = newScore;
    localStorage.setItem('flappy_best', btoa("feje_" + highScore));
  }

  renderLeaderboard();
  updateScoreDisplay();
}

function getSecureScore() {
  const raw = localStorage.getItem('flappy_best');
  if (!raw) return 0;
  try {
    const decoded = atob(raw);
    if (decoded.startsWith("feje_")) {
      return parseInt(decoded.split("_")[1]);
    }
  } catch (e) { return 0; }
  return 0;
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  let data = [];
  try {
    data = JSON.parse(localStorage.getItem('flappy_leaderboard')) || [];
  } catch(e) { data = []; }

  if (data.length === 0) {
    list.innerHTML = '<div style="text-align:center; color:#555; margin-top:20px;">No data yet.<br>Be the first!</div>';
    return;
  }

  list.innerHTML = data.map((entry, index) => `
    <div class="lb-entry">
      <span>#${index + 1} ${entry.name.substring(0, 12)}</span>
      <span>${entry.score}</span>
    </div>
  `).join('');
}

function updateScoreDisplay() {
  const currentEl = document.getElementById('current-score');
  if(currentEl) currentEl.innerText = score;
  const bestEl = document.getElementById('best-score');
  if(bestEl) bestEl.innerText = highScore;
}

// Init
renderLeaderboard();
updateScoreDisplay();
