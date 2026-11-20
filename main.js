// Step 2: draw soft rounded shapes in pale colours.
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
let width = 0, height = 0;

// My pale colour palette (hue, saturation, lightness)
const palette = [
  [200, 70, 82], [320, 60, 86], [160, 55, 80],
  [45, 75, 85], [265, 60, 85], [10, 70, 85]
];

const shapes = [];

// Simple random helper
function rand(a, b) { return a + Math.random() * (b - a); }

// Make a handful of shapes at random spots (they don't move yet!)
function makeShapes() {
  shapes.length = 0;
  const count = 9;
  const base = Math.min(width, height);
  for (let i = 0; i < count; i++) {
    shapes.push({
      x: rand(0.1, 0.9) * width,
      y: rand(0.1, 0.9) * height,
      size: rand(0.06, 0.14) * base,
      angle: rand(0, Math.PI * 2),
      sides: [0, 3, 4, 0][i % 4], // 0 means a circle
      color: palette[i % palette.length]
    });
  }
}

// Trace a polygon with rounded corners so nothing looks sharp
function roundedPolygon(s) {
  const n = s.sides;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = s.angle + (i / n) * Math.PI * 2;
    pts.push([s.x + Math.cos(a) * s.size, s.y + Math.sin(a) * s.size]);
  }
  const r = s.size * 0.45;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p = pts[i], next = pts[(i + 1) % n], prev = pts[(i + n - 1) % n];
    const m1 = [(p[0] + prev[0]) / 2, (p[1] + prev[1]) / 2];
    const m2 = [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2];
    if (i === 0) ctx.moveTo(m1[0], m1[1]);
    ctx.arcTo(p[0], p[1], m2[0], m2[1], r);
  }
  ctx.closePath();
}

function drawShape(s) {
  const [h, sat, l] = s.color;
  // a soft radial gradient gives the glow
  const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 1.3);
  g.addColorStop(0, 'hsla(' + h + ',' + sat + '%,' + (l + 8) + '%,0.9)');
  g.addColorStop(0.7, 'hsla(' + h + ',' + sat + '%,' + l + '%,0.6)');
  g.addColorStop(1, 'hsla(' + h + ',' + sat + '%,' + l + '%,0.25)');
  ctx.fillStyle = g;
  ctx.shadowColor = 'hsla(' + h + ',' + sat + '%,' + l + '%,0.8)';
  ctx.shadowBlur = s.size * 0.6;
  if (s.sides === 0) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
  } else {
    roundedPolygon(s);
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}

function draw() {
  ctx.fillStyle = '#14121f';
  ctx.fillRect(0, 0, width, height);
  for (const s of shapes) drawShape(s);
}

// Fit the canvas to the window, sharp on phones too
function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  makeShapes();
  draw();
}

window.addEventListener('resize', resize);
resize();
