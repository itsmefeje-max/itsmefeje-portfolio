// main.js

// 1. CANVAS BACKGROUND (Keep your existing nice animation, just slight tweak on color)
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
  t += 0.005; // Slower, more majestic
  
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // We just want subtle moving blobs, not a full fill
  // This creates a "Northern Lights" effect at the top
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, `hsla(${240 + Math.sin(t)*30}, 50%, 8%, 1)`); 
  g.addColorStop(0.4, `hsla(0, 0%, 0%, 0)`); // Fade out quickly
  
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}
drawFrame();

// 2. SPOTLIGHT EFFECT
// This looks for elements with class 'spotlight-cards' and applies the logic to children
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
