/* -- Indicating what the script is for: Logic for Text Shuffle, Mobile Interactions, Animations, and URL Routing */

// 1. SHUFFLE TEXT (Logo) - Initialize safely
document.addEventListener('DOMContentLoaded', () => {
  const logoText = document.querySelector('#nav-logo-text');
  // Only run if the element actually exists
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
      // Stop observing once revealed to save performance
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 3. SPOTLIGHT MOUSE & TOUCH TRACKING
document.querySelectorAll('.spotlight-card').forEach(card => {
  // Desktop Interaction
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });

  // Mobile Interaction
  card.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    
    // Ensure touch is inside the card
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      card.style.setProperty('--mouse-x', `${touch.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${touch.clientY - rect.top}px`);
      card.classList.add('touch-active');
    } else {
      card.classList.remove('touch-active');
    }
  }, { passive: true });

  card.addEventListener('touchend', () => {
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
      
      // Always close mobile menu on click
      if (navLinks) {
        navLinks.classList.remove('active');
        if (mobileBtn) mobileBtn.classList.remove('open');
      }

      // Handle in-page links (e.g., #about)
      if (href && href.includes('#')) {
        const targetId = href.split('#')[1];
        const section = document.getElementById(targetId);
        if (section) {
          e.preventDefault();
          section.scrollIntoView({ behavior: 'smooth' });
          // Update the browser URL without reloading
          history.pushState(null, '', `/${targetId}`);
        }
      }
    });
  });
});

// 6. INITIAL LOAD ROUTER (The Fix for Refreshing)
// This logic runs immediately when the page loads to restore the correct section.
window.addEventListener('load', () => {
  // 1. Get the path and remove leading/trailing slashes (e.g. "/learning/" -> "learning")
  const rawPath = window.location.pathname;
  const path = rawPath.replace(/^\/|\/$/g, '');
  
  // 2. Safety Check:
  // - Ensure path isn't empty (Home)
  // - Ensure we aren't on index.html explicitly
  // - Ensure we aren't on the Arcade page (which has its own file)
  if (path && path !== 'index.html' && path.toLowerCase() !== 'arcade') {
    
    // 3. Find the section
    const targetSection = document.getElementById(path);
    
    if (targetSection) {
      // 4. Scroll to it. The timeout ensures the layout is painted first.
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});
