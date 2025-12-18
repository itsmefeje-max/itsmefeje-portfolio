// main.js
// Safe animated background using Canvas (no libraries)

const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

let t = 0;

function animate() {
  requestAnimationFrame(animate);
  t += 0.01;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `hsl(${220 + Math.sin(t) * 20}, 80%, 20%)`);
  gradient.addColorStop(1, `hsl(${260 + Math.cos(t) * 20}, 80%, 15%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

animate();

console.log("Canvas background running.");
