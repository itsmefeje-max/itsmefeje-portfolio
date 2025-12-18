// main.js
// Minimal WebGL background test using OGL

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("background");

  if (!container) {
    console.error("Background container not found.");
    return;
  }

  const renderer = new ogl.Renderer({
    alpha: true,
    antialias: true
  });

  const gl = renderer.gl;
  gl.clearColor(0.05, 0.05, 0.08, 1);

  container.appendChild(gl.canvas);

  function resize() {
    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );
  }

  window.addEventListener("resize", resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);

    // subtle pulsing background color
    const t = Date.now() * 0.0002;
    gl.clearColor(
      0.05 + Math.sin(t) * 0.02,
      0.05,
      0.08 + Math.cos(t) * 0.02,
      1
    );

    renderer.render({ scene: null });
  }

  animate();

  console.log("WebGL background initialized.");
});
