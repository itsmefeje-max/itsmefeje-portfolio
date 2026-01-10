/* -- Indicating what the script is for: Logic for Text Shuffle, Mobile Interactions, Animations, and Clean URLs */

// 1. SHUFFLE TEXT (Logo)
document.addEventListener('DOMContentLoaded', () => {
  // We now target the ID we added in index.html
  const logoText = document.querySelector('#nav-logo-text');
  
  if (logoText) {
    const shuffle = new ShuffleText(logoText, {
      text: "Itsmefeje", 
      shuffleTimes: 4,
      shuffleDirection: 'up',   // Matches the React vertical slot feel
      duration: 0.5,            // Slightly customized for smoothness
      stagger: 0.04,
      animationMode: 'evenodd', // This is the feature you asked for
      triggerOnHover: true,
      scrambleCharset: '!<>-_\\/[]{}—=+*^?#________' 
    });

    logoText.addEventListener('click', () => {
      shuffle.play();
    });
  }
});

// 2. SCROLL REVEAL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 3. SPOTLIGHT MOUSE & TOUCH TRACKING
document.querySelectorAll('.spotlight-card').forEach(card => {
  // Desktop
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });

  // Mobile
  card.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    
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

// 5. CLEAN URL HANDLING (Scroll Only, No URL Update)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Close mobile menu if it's open
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (mobileBtn) mobileBtn.classList.remove('open');
      }

      // Handle Section Links (e.g. #about)
      if (href && href.length > 1) { 
        const targetId = href.substring(1); 
        const section = document.getElementById(targetId);
        
        if (section) {
          e.preventDefault(); 
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
