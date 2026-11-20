// Step 1: set up the canvas and keep it the right size.
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
let width = 0, height = 0;

// Fit the canvas to the window, sharp on phones too
function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

// For now I only paint the blank night background
function draw() {
  ctx.fillStyle = '#14121f';
  ctx.fillRect(0, 0, width, height);
}

window.addEventListener('resize', resize);
resize();
