const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');

let W = 0, H = 0, dpr = 1, last = 0, y = 0, hideTimer = 0;

const WIDTHS = [5, 4, 3, 2, 1.5];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
}

function frame(ts) {
  if (!last) last = ts;
  const dt = Math.min((ts - last) / 1000, .05);
  last = ts;
  ctx.clearRect(0, 0, W, H);
  const len = H * .3;
  y += H * .16 * dt;
  if (y - len > H) y = -H * .15;
  const ty = y - len;
  ctx.strokeStyle = 'rgba(255,255,255,.5)';
  for (let i = 0; i < 5; i++) {
    const x = W * (i + .5) / 5;
    ctx.lineWidth = WIDTHS[i];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, ty);
    ctx.stroke();
  }
  requestAnimationFrame(frame);
}

function wake() {
  ui.classList.add('show');
  document.body.classList.remove('idle');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    ui.classList.remove('show');
    document.body.classList.add('idle');
  }, 2600);
}

WIDTHS.forEach(w => {
  const s = document.createElement('span');
  s.textContent = w + '';
  ui.appendChild(s);
});

addEventListener('pointermove', wake);
addEventListener('pointerdown', wake);
addEventListener('resize', resize);

resize();
wake();
requestAnimationFrame(frame);
