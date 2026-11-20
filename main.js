// Step 4: make the shapes glide toward the pointer.
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
let width = 0, height = 0;

// My pale colour palette (hue, saturation, lightness)
const palette = [
  [200, 70, 82], [320, 60, 86], [160, 55, 80],
  [45, 75, 85], [265, 60, 85], [10, 70, 85]
];

const shapes = [];

// The pointer: when inactive, shapes just drift
const pointer = { x: 0, y: 0, active: false, strength: 0 };

function rand(a, b) { return a + Math.random() * (b - a); }

// Make shapes; mostly soft circles, a few rounded triangles and squares
function makeShapes() {
  shapes.length = 0;
  const count = 9;
  const base = Math.min(width, height);
  for (let i = 0; i < count; i++) {
    const dir = rand(0, Math.PI * 2);
    const speed = rand(0.01, 0.035) * base;
    shapes.push({
      x: rand(0.1, 0.9) * width,
      y: rand(0.1, 0.9) * height,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      // extra velocity from the pointer pull, kept separate so drifting stays gentle
      px: 0, py: 0,
      pull: rand(0.5, 1.4), // each shape is a little more or less eager
      spin: rand(-0.15, 0.15),
      size: rand(0.06, 0.14) * base,
      angle: rand(0, Math.PI * 2),
      sides: [0, 0, 3, 0, 0, 4][i % 6], // 0 means a circle
      color: palette[i % palette.length],
      phase: rand(0, Math.PI * 2)
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

function update(dt, t) {
  // ease the overall pull in and out so it never snaps on or off
  const target = pointer.active ? 1 : 0;
  pointer.strength += (target - pointer.strength) * Math.min(1, dt * 3);
  const base = Math.min(width, height);

  for (const s of shapes) {
    if (pointer.strength > 0.001) {
      const dx = pointer.x - s.x, dy = pointer.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      // gentle spring toward the pointer, but ease off when close so they hover around it
      const near = Math.min(1, dist / (base * 0.25));
      const accel = 0.9 * s.pull * pointer.strength * near;
      s.px += (dx / dist) * accel * base * 0.3 * dt;
      s.py += (dy / dist) * accel * base * 0.3 * dt;
    }
    // damping makes the glide smooth instead of jittery
    const damp = Math.exp(-1.6 * dt);
    s.px *= damp;
    s.py *= damp;

    const wob = Math.sin(t * 0.0003 + s.phase) * 0.004 * base;
    s.x += (s.vx + wob + s.px) * dt;
    s.y += (s.vy - wob + s.py) * dt;
    s.angle += s.spin * dt;

    const m = s.size * 1.5;
    if (s.x < -m) s.x = width + m;
    if (s.x > width + m) s.x = -m;
    if (s.y < -m) s.y = height + m;
    if (s.y > height + m) s.y = -m;
  }
}

function draw() {
  ctx.fillStyle = '#14121f';
  ctx.fillRect(0, 0, width, height);
  for (const s of shapes) drawShape(s);
}

// dt is capped so a hidden tab doesn't cause a big jump
let last = 0;
function frame(t) {
  const dt = Math.min((t - last) / 1000, 0.05);
  last = t;
  update(dt, t);
  draw();
  requestAnimationFrame(frame);
}

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

// Pointer events cover mouse, touch and pen in one go
function setPointer(e) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
  if (hint) { hint.style.opacity = '0'; }
}
canvas.addEventListener('pointermove', setPointer);
canvas.addEventListener('pointerdown', setPointer);
canvas.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') pointer.active = false; });
canvas.addEventListener('pointercancel', function () { pointer.active = false; });
canvas.addEventListener('pointerleave', function () { pointer.active = false; });

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(function (t) { last = t; frame(t); });
