// 1. SCROLL REVEAL & ACTIVE NAV SYSTEM
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 2. SPOTLIGHT MOUSE TRACKING
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// 3. CANVAS BACKGROUND
const canvas = document.getElementById("network-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];

function initCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  particles = [];
  const particleCount = width > 800 ? 50 : 25; 
  
  for(let i = 0; i < particleCount; i++) {
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
  
  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    
    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 150) {
        ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 - dist/1000})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  });
  
  requestAnimationFrame(animate);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animate();

// 4. YEAR UPDATE
const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

// 5. MOBILE MENU TOGGLE
const mobileBtn = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileBtn && navLinks) {
  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileBtn.classList.toggle('open');
  });

  // Close menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileBtn.classList.remove('open');
    });
  });
}

// 6. CLEAN URL ROUTER (For Vercel)
document.addEventListener('DOMContentLoaded', () => {
  
  // A. Handle clicks on Nav Links (prevent reload, smooth scroll, change URL)
  const links = document.querySelectorAll('.nav-links a');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      // Get the target path (e.g., "/#about" or "index.html#about")
      const href = link.getAttribute('href');
      
      // If the link is pointing to an ID on this page
      if (href && href.includes('#')) {
        const targetId = href.split('#')[1];
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          e.preventDefault(); // Stop the hard reload
          
          // Smooth scroll
          targetSection.scrollIntoView({ behavior: 'smooth' });
          
          // Change URL to /about (without hash)
          history.pushState(null, '', `/${targetId}`);
        }
      }
    });
  });

  // B. Handle Page Load (if user refreshes on /about)
  const path = window.location.pathname; // e.g., "/about"
  if (path !== '/' && path !== '/index.html' && path !== '/Arcade.html') {
    // Remove the slash to get the ID (e.g., "about")
    const targetId = path.substring(1); 
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      // Small delay to ensure page layout is ready
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});
