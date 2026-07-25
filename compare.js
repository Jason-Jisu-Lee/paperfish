const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');

let W = 0, H = 0, dpr = 1, last = 0, y = 0, hideTimer = 0;

const NAMES = ['solid', 'taper', 'blur', 'comet', 'soft'];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
}

function grad(x, y1, y2, stops) {
  const g = ctx.createLinearGradient(x, y1, x, y2);
  for (const [o, a] of stops) g.addColorStop(o, `rgba(255,255,255,${a})`);
  return g;
}

function line(x, y1, y2, lw, style) {
  ctx.strokeStyle = style;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
}

function frame(ts) {
  if (!last) last = ts;
  const dt = Math.min((ts - last) / 1000, .05);
  last = ts;
  ctx.clearRect(0, 0, W, H);
  const len = H * .3;
  const lw = 5;
  y += H * .16 * dt;
  if (y - len > H) y = -H * .15;
  const ty = y - len;
  for (let i = 0; i < 5; i++) {
    const x = W * (i + .5) / 5;
    if (i === 0) line(x, y, ty, lw, 'rgba(255,255,255,.5)');
    else if (i === 1) line(x, y, ty, lw, grad(x, y, ty, [[0, .55], [1, 0]]));
    else if (i === 2) line(x, y, ty, lw, grad(x, y, ty, [[0, 0], [.5, .55], [1, 0]]));
    else if (i === 3) {
      line(x, y, ty, lw, grad(x, y, ty, [[0, .5], [1, 0]]));
      line(x, y, y - len * .1, lw, 'rgba(255,255,255,.95)');
    } else {
      line(x, y, ty, lw * 3, 'rgba(255,255,255,.10)');
      line(x, y, ty, lw * 1.8, 'rgba(255,255,255,.16)');
      line(x, y, ty, lw, 'rgba(255,255,255,.34)');
    }
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

NAMES.forEach((n, i) => {
  const s = document.createElement('span');
  s.textContent = (i + 1) + ' ' + n;
  ui.appendChild(s);
});

addEventListener('pointermove', wake);
addEventListener('pointerdown', wake);
addEventListener('resize', resize);

resize();
wake();
requestAnimationFrame(frame);
