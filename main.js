// main.js

// 1. SCROLL REVEAL & ACTIVE NAV SYSTEM
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add 'visible' class to .reveal-content children
      const revealItem = entry.target.querySelector('.reveal-content');
      if(revealItem) revealItem.classList.add('visible');
      
      // Update Nav Active State
      const id = entry.target.getAttribute('id');
      if (id) {
        document.querySelectorAll('nav a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
        });
      }
    }
  });
}, { threshold: 0.3 }); // Trigger when 30% visible

document.querySelectorAll('section').forEach(section => observer.observe(section));

// 2. SPOTLIGHT MOUSE TRACKING (The "React Bits" Effect)
// We attach listeners to ".spotlight-group" containers
document.querySelectorAll('.spotlight-group').forEach(group => {
  group.addEventListener('mousemove', (e) => {
    const cards = group.querySelectorAll('.spotlight-item');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});

// Also enable spotlight for single buttons that are not in a group
document.querySelectorAll('.spotlight-item:not(.spotlight-group .spotlight-item)').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    item.style.setProperty('--mouse-x', `${x}px`);
    item.style.setProperty('--mouse-y', `${y}px`);
  });
});

// 3. CANVAS BACKGROUND (Moving Cyber Grid)
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];

function initCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  // Create grid points
  particles = [];
  const spacing = 40;
  for(let x = 0; x < width; x += spacing) {
    for(let y = 0; y < height; y += spacing) {
      particles.push({ x, y, baseAlpha: 0.1, phase: Math.random() * Math.PI * 2 });
    }
  }
}

let time = 0;
function animate() {
  ctx.clearRect(0, 0, width, height);
  time += 0.02;
  
  // Draw subtle moving dots
  particles.forEach(p => {
    // Oscillate alpha for "breathing" effect
    const alpha = p.baseAlpha + Math.sin(time + p.phase) * 0.05;
    
    ctx.fillStyle = `rgba(100, 110, 255, ${alpha > 0 ? alpha : 0})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animate();

// 4. YEAR UPDATE
const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();
