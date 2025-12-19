// 1. SCROLL REVEAL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 2. CONSTELLATION CANVAS
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function init() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  particles = [];
  const particleCount = width > 800 ? 60 : 30; // Fewer on mobile
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'; // Low opacity indigo lines
  
  particles.forEach((p, index) => {
    // Move
    p.x += p.vx;
    p.y += p.vy;
    
    // Bounce
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
    
    // Draw Dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Connect Lines
    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 150) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  });
  
  requestAnimationFrame(animate);
}

window.addEventListener('resize', init);
init();
animate();

// 3. DYNAMIC YEAR
document.getElementById('year').textContent = new Date().getFullYear();
