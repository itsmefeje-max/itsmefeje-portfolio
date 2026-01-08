// -- Indicating what the script is for: Handles Scroll Reveal, Spotlight UI tracking, and Navigation routing.

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

// 2. SPOTLIGHT MOUSE TRACKING (Refined)
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Updates the CSS variables for the radial gradient mask
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// 3. YEAR UPDATE
const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

// 4. MOBILE MENU TOGGLE
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

// 5. CLEAN URL ROUTER (For Vercel)
document.addEventListener('DOMContentLoaded', () => {
  
  // A. Handle clicks on Nav Links
  const links = document.querySelectorAll('.nav-links a');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      if (href && href.includes('#')) {
        const targetId = href.split('#')[1];
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', `/${targetId}`);
        }
      }
    });
  });

  // B. Handle Page Load
  const path = window.location.pathname; 
  if (path !== '/' && path !== '/index.html' && path !== '/Arcade.html') {
    const targetId = path.substring(1); 
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});
