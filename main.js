/* -- Indicating what the script is for: Logic for Text Shuffle, Mobile Interactions, Animations, and URL Routing */

// 1. SHUFFLE TEXT (Logo) - Initialize safely
document.addEventListener('DOMContentLoaded', () => {
  const logoText = document.querySelector('#nav-logo-text');
  if (logoText) {
    const shuffle = new ShuffleText(logoText, {
      text: "Itsmefeje", 
      shuffleTimes: 4,
      shuffleDirection: 'up', 
      duration: 0.6,
      stagger: 0.05,
      triggerOnHover: true, // Desktop
      scrambleCharset: '!<>-_\\/[]{}—=+*^?#________' 
    });

    // Mobile: Replay shuffle on click since there is no hover
    logoText.addEventListener('click', () => {
      shuffle.play();
    });
  }
});

// 2. SCROLL REVEAL (Optimized for Mobile)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // Optional: Stop observing once revealed for performance
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 }); // Trigger when 10% visible

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 3. SPOTLIGHT MOUSE & TOUCH TRACKING (Mobile Fix)
document.querySelectorAll('.spotlight-card').forEach(card => {
  // Desktop Hover
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });

  // Mobile Touch - Enables Spotlight on Touch/Drag
  card.addEventListener('touchmove', (e) => {
    // Prevent default scroll only if horizontal swipe? 
    // Usually better to allow scroll, so we don't preventDefault here.
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    
    // Check if touch is actually inside the card boundaries
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          
      card.style.setProperty('--mouse-x', `${touch.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${touch.clientY - rect.top}px`);
      
      // Force the opacity to 1 via class since :hover doesn't exist
      card.classList.add('touch-active');
    } else {
      card.classList.remove('touch-active');
    }
  }, { passive: true });

  card.addEventListener('touchend', () => {
    // Optional: Fade out after touch ends
    setTimeout(() => card.classList.remove('touch-active'), 500);
  });
});

// 4. MOBILE MENU & YEAR
const mobileBtn = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileBtn && navLinks) {
  mobileBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('active');
    
    if (isOpen) {
      navLinks.classList.remove('active');
      mobileBtn.classList.remove('open');
    } else {
      navLinks.classList.add('active');
      mobileBtn.classList.add('open');
    }
  });
}

const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

// 5. CLEAN URL ROUTER & MENU CLOSE (Click Handling)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Close mobile menu immediately on click
      if (navLinks) {
        navLinks.classList.remove('active');
        if (mobileBtn) mobileBtn.classList.remove('open');
      }

      if (href && href.includes('#')) {
        const targetId = href.split('#')[1];
        const section = document.getElementById(targetId);
        if (section) {
          e.preventDefault();
          section.scrollIntoView({ behavior: 'smooth' });
          // Update URL without #
          history.pushState(null, '', `/${targetId}`);
        }
      }
    });
  });
});

// 6. INITIAL LOAD ROUTER (Fixes Refresh/Direct Access)
// This checks if the user landed on /about, /goals, etc. and scrolls there automatically.
window.addEventListener('load', () => {
  const path = window.location.pathname.replace('/', ''); // Get "about" from "/about"
  
  if (path && path !== 'index.html') {
    const targetSection = document.getElementById(path);
    if (targetSection) {
      // Small timeout ensures the layout is ready before scrolling
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});
