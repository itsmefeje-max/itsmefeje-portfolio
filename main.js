// main.js
// Canvas background + small site helpers (active nav, 404-safe)
const canvas = document.getElementById("background");
const ctx = canvas?.getContext?.("2d") || null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Reduced motion support
const prefersReduced = window.__prefersReducedMotion === true || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let t = 0;
let raf = null;

function drawFrame() {
  if (!ctx) return;
  if (prefersReduced) {
    // static gradient for reduced-motion users
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, 'hsl(230,36%,15%)');
    g.addColorStop(1, 'hsl(260,36%,12%)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    return;
  }

  raf = requestAnimationFrame(drawFrame);
  t += 0.01;
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, `hsl(${220 + Math.sin(t)*20},80%,20%)`);
  g.addColorStop(1, `hsl(${260 + Math.cos(t)*20},80%,15%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}
drawFrame();

// Active nav highlighter
(function setActiveNav() {
  const links = document.querySelectorAll('nav a[data-link]');
  if (!links.length) return;
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const link = a.getAttribute('data-link');
    if (link === current || (current === '' && link === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
})();

// Helpful debug: if landing on a missing page from server, show console hint.
// Vercel sometimes serves 404 pages with custom IDs we saw earlier.
// This is a noninvasive hint only.
(function debugLinking() {
  if (location.pathname === '/404' || document.title.includes('not found') || document.title.toLowerCase().includes('not found')) {
    console.warn('Page not found — check that the file exists at the site root (e.g., about.html). If you see Vercel ID errors, ensure the files are in the repo root and redeploy.');
  }
})();
