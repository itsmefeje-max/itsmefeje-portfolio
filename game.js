/* COSMIC FLAP GAME ENGINE (FIXED) */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game Configuration
let frames = 0;
let score = 0;
let gamespeed = 2;
let isGameOver = false;
let isPlaying = false;
const gravity = 0.25;
const pipeGap = 120; // Fixed gap size (Playable)

// Set Canvas Size
canvas.width = 400;
canvas.height = 600;

// User Data
const username = localStorage.getItem('flappy_username') || "Anonymous Pilot";
let highScore = getSecureScore(); 

// --- BIRD CLASS --- //
class Bird {
  constructor() {
    this.x = 50;
    this.y = 150;
    this.velocity = 0;
    this.width = 20;
    this.height = 20;
    this.jumpStrength = 4.5;
  }

  draw() {
    ctx.fillStyle = '#6366f1'; // Indigo Bird
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#6366f1';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }

  update() {
    this.velocity += gravity;
    this.y += this.velocity;

    // Floor Collision
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      gameOver();
    }
    // Ceiling Collision
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  flap() {
    this.velocity = -this.jumpStrength;
  }
}

// --- PIPE CLASS --- //
const pipes = [];
class Pipe {
  constructor() {
    this.x = canvas.width;
    this.width = 50;
    this.passed = false;
    
    // GUARANTEED GAP GENERATION
    // Min pipe height = 50px
    // Max available space = height - gap - 100 (buffer for top/bottom)
    const minHeight = 50;
    const maxTop = canvas.height - pipeGap - minHeight;
    
    this.topHeight = Math.floor(Math.random() * (maxTop - minHeight + 1)) + minHeight;
    this.bottomY = this.topHeight + pipeGap;
    this.bottomHeight = canvas.height - this.bottomY;
  }

  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;

    // Top Pipe
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);

    // Bottom Pipe
    ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
    ctx.strokeRect(this.x, this.bottomY, this.width, this.bottomHeight);
  }

  update() {
    this.x -= gamespeed;

    // Collision Logic
    if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
      if (bird.y < this.topHeight || bird.y + bird.height > this.bottomY) {
        gameOver();
      }
    }

    // Score Update
    if (this.x + this.width < bird.x && !this.passed) {
      score++;
      updateScoreDisplay();
      this.passed = true;
      // Slight difficulty increase
      if(score % 5 === 0) gamespeed += 0.2;
    }
  }
}

const bird = new Bird();

// --- GAME LOOP --- //
function initGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  gamespeed = 2;
  frames = 0;
  isGameOver = false;
  isPlaying = true;
  
  updateScoreDisplay();
  
  // Hide UI
  document.getElementById('game-overlay').classList.remove('active');
  document.getElementById('start-overlay').classList.remove('active');
  
  animate();
}

function animate() {
  if (!isPlaying) return; 

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Stars Background
  drawBackground();

  // Bird Logic
  bird.update();
  bird.draw();

  // Pipe Logic (Every 120 frames)
  if (frames % 120 === 0) {
    pipes.push(new Pipe());
  }

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].update();
    pipes[i].draw();

    // Clean up off-screen pipes
    if (pipes[i].x + pipes[i].width < 0) {
      pipes.shift();
      i--;
    }
  }

  frames++;
  requestAnimationFrame(animate);
}

function drawBackground() {
  ctx.fillStyle = 'white';
  for(let i=0; i<15; i++) {
     let x = (frames * 0.2 + i * 80) % canvas.width;
     let y = (i * 45) % canvas.height;
     ctx.fillRect(x, y, 2, 2);
  }
}

function gameOver() {
  isPlaying = false;
  isGameOver = true;
  
  // Security Check (Basic Speedhack protection)
  const maxPossible = Math.ceil(frames / 100); 
  if (score > maxPossible + 5) {
      score = 0; // Invalidate cheaters
  }

  saveScore(score);
  
  document.getElementById('final-score-display').innerText = `Score: ${score}`;
  document.getElementById('game-overlay').classList.add('active');
}

// --- INPUT HANDLING (FIXED) --- //
function handleInput() {
  if (isGameOver) {
    initGame(); // RESTART if dead
  } else if (!isPlaying) {
    initGame(); // START if waiting
  } else {
    bird.flap(); // FLAP if playing
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault(); // Stop scrolling
    handleInput();
  }
});

canvas.addEventListener('click', (e) => {
  e.preventDefault();
  handleInput();
});

document.getElementById('restart-btn').addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent canvas click trigger
  initGame();
});

// --- LEADERBOARD SYSTEM (ANTI-SPAM) --- //

function saveScore(newScore) {
  let leaderboard = JSON.parse(localStorage.getItem('flappy_leaderboard')) || [];
  
  // Check if user already exists
  const existingUserIndex = leaderboard.findIndex(entry => entry.name === username);

  if (existingUserIndex !== -1) {
    // User exists: Update only if new score is higher
    if (newScore > leaderboard[existingUserIndex].score) {
      leaderboard[existingUserIndex].score = newScore;
      leaderboard[existingUserIndex].date = new Date().toLocaleDateString();
    }
  } else {
    // New User: Add them
    leaderboard.push({ name: username, score: newScore, date: new Date().toLocaleDateString() });
  }
  
  // Sort High to Low
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep Top 10
  leaderboard = leaderboard.slice(0, 10);
  
  localStorage.setItem('flappy_leaderboard', JSON.stringify(leaderboard));
  
  // Save Personal Best
  if (newScore > highScore) {
    highScore = newScore;
    const salt = "feje_secure_";
    localStorage.setItem('flappy_best', btoa(salt + highScore)); 
  }
  
  renderLeaderboard();
  updateScoreDisplay();
}

function getSecureScore() {
  const raw = localStorage.getItem('flappy_best');
  if (!raw) return 0;
  try {
    const decoded = atob(raw);
    if (decoded.startsWith("feje_secure_")) {
      return parseInt(decoded.split("_")[2]);
    }
  } catch (e) { return 0; }
  return 0;
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const data = JSON.parse(localStorage.getItem('flappy_leaderboard')) || [];
  
  if(data.length === 0) {
    list.innerHTML = '<div style="text-align:center; color:#555; margin-top:20px;">No data yet.<br>Be the first!</div>';
    return;
  }

  list.innerHTML = data.map((entry, index) => `
    <div class="lb-entry">
      <span>#${index + 1} ${entry.name}</span>
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

// Initial Load
renderLeaderboard();
updateScoreDisplay();
