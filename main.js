// -- Indicating what the script is for: Logic for Text Shuffle, Mouse Tracking, and Navigation.

// 1. SHUFFLE TEXT (Logo) - Initialize safely
document.addEventListener('DOMContentLoaded', () => {
  // Check if the element exists first
  const logoText = document.querySelector('#nav-logo-text');
  if (logoText) {
    new ShuffleText(logoText, {
      text: "Itsmefeje", // Explicitly set text to ensure it's there
      shuffleTimes: 4,
      shuffleDirection: 'up', 
      duration: 0.6,
      stagger: 0.05,
      triggerOnHover: true,
      // Default charset (Matrix style)
      scrambleCharset: '!<>-_\\/[]{}—=+*^?#________' 
    });
  }
});

// 2. SCROLL REVEAL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 3. SPOTLIGHT MOUSE TRACKING
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
});

// 4. MOBILE MENU & YEAR
const mobileBtn = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
if (mobileBtn) {
  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileBtn.classList.toggle('open');
  });
}
const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

// 5. CLEAN URL ROUTER
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.includes('#')) {
        const targetId = href.split('#')[1];
        const section = document.getElementById(targetId);
        if (section) {
          e.preventDefault();
          section.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', `/${targetId}`);
          // Close mobile menu if open
          if (navLinks) navLinks.classList.remove('active');
        }
      }
    });
  });
});
