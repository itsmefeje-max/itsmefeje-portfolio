// main.js

// 1. CANVAS BACKGROUND
const canvas = document.getElementById("background");
const ctx = canvas?.getContext?.("2d") || null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let t = 0;
function drawFrame() {
  if (!ctx) return;
  requestAnimationFrame(drawFrame);
  t += 0.003; // Very slow, majestic movement
  
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Create a subtle "Aurora" effect
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  // Dark blue/purple hue shifting slightly
  g.addColorStop(0, `hsla(${240 + Math.sin(t)*20}, 40%, 10%, 1)`); 
  g.addColorStop(0.5, `hsla(0, 0%, 0%, 0)`); // Fade to transparent black
  
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
drawFrame();

// 2. SPOTLIGHT MOUSE TRACKING
// Looks for containers with class 'spotlight-cards' and updates CSS variables
const spotlightWrappers = document.querySelectorAll('.spotlight-cards');

spotlightWrappers.forEach(wrapper => {
  wrapper.onmousemove = e => {
    for(const card of wrapper.getElementsByClassName('card')) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  }
});

// 3. AUTO-UPDATE YEAR
const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

// 4. ACTIVE NAV STATE
(function setActiveNav() {
  const links = document.querySelectorAll('nav a[data-link]');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    if (a.getAttribute('data-link') === current) a.classList.add('active');
  });
})();

// 5. DEBUGGING 404s (Vercel/Hosts)
if (location.pathname === '/404' || document.title.toLowerCase().includes('not found')) {
  console.log('404 Page Loaded');
}
