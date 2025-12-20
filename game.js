/* COSMIC FLAP GAME ENGINE 
  Developed by: Itsmefeje (Simulated)
*/

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game State
let frames = 0;
let score = 0;
let gamespeed = 2;
let isGameOver = false;
let isPlaying = false;
const gravity = 0.25;

// Set Canvas Size
canvas.width = 400;
canvas.height = 600;

// User Data
const username = localStorage.getItem('flappy_username') || "Anonymous Pilot";
let highScore = getSecureScore(); 

// --- CLASSES --- //

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
    // Simple glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#6366f1';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0; // Reset
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

const pipes = [];
class Pipe {
  constructor() {
    this.top = (Math.random() * canvas.height/2) + 50;
    this.bottom = (Math.random() * canvas.height/2) + 50;
    this.x = canvas.width;
    this.width = 40;
    this.color = '#fff';
    this.passed = false;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; // Glass pipe look
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    // Top Pipe
    ctx.fillRect(this.x, 0, this.width, this.top);
    ctx.strokeRect(this.x, 0, this.width, this.top);

    // Bottom Pipe
    ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
    ctx.strokeRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
  }

  update() {
    this.x -= gamespeed;

    // Collision Logic (Fairness Check included implicitly by strict hitboxes)
    // 1. Horizontal Hit
    if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
      // 2. Vertical Hit (Top or Bottom)
      if (bird.y < this.top || bird.y + bird.height > canvas.height - this.bottom) {
        gameOver();
      }
    }

    // Score Counting
    if (this.x + this.width < bird.x && !this.passed) {
      score++;
      updateScoreDisplay();
      this.passed = true;
      
      // Fairness: Increase speed slightly to make it harder (Skill Gap)
      if(score % 5 === 0) gamespeed += 0.2;
    }
  }
}

// --- GAME LOGIC --- //

const bird = new Bird();

function initGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  gamespeed = 2;
  frames = 0;
  isGameOver = false;
  updateScoreDisplay();
  
  document.getElementById('game-overlay').classList.remove('active');
  document.getElementById('start-overlay').classList.remove('active');
  
  if (!isPlaying) {
    isPlaying = true;
    animate();
  }
}

function animate() {
  if (isGameOver) return; // Stop loop on death

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid (Cosmic Vibe)
  drawBackground();

  // Bird Logic
  bird.update();
  bird.draw();

  // Pipe Logic (Generate every 100 frames)
  if (frames % 100 === 0) {
    pipes.push(new Pipe());
  }

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].update();
    pipes[i].draw();

    // Remove old pipes to save memory (Optimization)
    if (pipes[i].x + pipes[i].width < 0) {
      pipes.shift();
    }
  }

  frames++;
  requestAnimationFrame(animate);
}

function drawBackground() {
  // Simple moving stars could go here
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for(let i=0; i<10; i++) {
     let x = (frames * 0.5 + i * 50) % canvas.width;
     ctx.fillRect(x, (i*60), 2, 2);
  }
}

function gameOver() {
  isGameOver = true;
  isPlaying = false;
  
  // Security Check: Is score realistically possible based on frames?
  // Max possible score is roughly frames / 100. If score >>> frames/100, they hacked.
  const maxPossible = Math.ceil(frames / 90); 
  if (score > maxPossible + 2) {
      console.warn("Cheater detected. Score invalidated.");
      score = 0;
  }

  saveScore(score);
  
  document.getElementById('final-score-display').innerText = `Score: ${score}`;
  document.getElementById('game-overlay').classList.add('active');
}

// --- INPUTS --- //
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if(!isPlaying && !isGameOver) initGame();
    else bird.flap();
  }
});

canvas.addEventListener('click', () => {
  if(!isPlaying && !isGameOver) initGame();
  else bird.flap();
});

document.getElementById('restart-btn').addEventListener('click', initGame);

// --- LEADERBOARD SYSTEM (Anti-Cheat / Fairness) --- //

// 1. Secure Save
function saveScore(newScore) {
  // Update local leaderboard
  let leaderboard = JSON.parse(localStorage.getItem('flappy_leaderboard')) || [];
  
  // Add new entry
  leaderboard.push({ name: username, score: newScore, date: new Date().toLocaleDateString() });
  
  // Sort by score (High to Low)
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 10
  leaderboard = leaderboard.slice(0, 10);
  
  localStorage.setItem('flappy_leaderboard', JSON.stringify(leaderboard));
  
  // Save personal best with "Salt" (Basic Obfuscation)
  if (newScore > highScore) {
    highScore = newScore;
    const salt = "feje_secure_";
    // Stores "feje_secure_10" in base64 to look like "ZmVqZV9zZWN1cmVfMTA="
    localStorage.setItem('flappy_best', btoa(salt + highScore)); 
  }
  
  renderLeaderboard();
  updateScoreDisplay();
}

// 2. Secure Retrieve
function getSecureScore() {
  const raw = localStorage.getItem('flappy_best');
  if (!raw) return 0;
  try {
    const decoded = atob(raw); // Decode base64
    if (decoded.startsWith("feje_secure_")) {
      return parseInt(decoded.split("_")[2]);
    }
  } catch (e) {
    return 0; // If data is corrupted/tampered, reset to 0
  }
  return 0;
}

// 3. Render
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
  document.getElementById('current-score').innerText = score;
  document.getElementById('best-score').innerText = highScore;
}

document.getElementById('clear-data').addEventListener('click', () => {
  if(confirm("Reset all leaderboard data?")) {
    localStorage.removeItem('flappy_leaderboard');
    localStorage.removeItem('flappy_best');
    highScore = 0;
    renderLeaderboard();
    updateScoreDisplay();
  }
});

// Init
renderLeaderboard();
updateScoreDisplay();
