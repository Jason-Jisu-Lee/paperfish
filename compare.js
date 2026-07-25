const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');

let W = 0, H = 0, dpr = 1, k = 1, area = 1;
let parts = [], cur = 0, last = 0, hideTimer = 0;

const WIDTHS = [5, 4, 3, 2, 1.5];
const C = {n: 400, spd: [520, 900], exp: .035, al: [.22, .50]};

const rand = (a, b) => a + Math.random() * (b - a);

function mk() {
  const spd = rand(C.spd[0], C.spd[1]) * k;
  return {
    x: rand(-60, W + 60),
    y: rand(-H * .1, H),
    spd,
    len: spd * C.exp,
    a: rand(C.al[0], C.al[1])
  };
}

function build() {
  parts = [];
  const n = Math.round(C.n * area);
  for (let i = 0; i < n; i++) parts.push(mk());
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  k = Math.min(Math.max(H / 900, .7), 1.6);
  area = Math.min(Math.max((W * H) / (1600 * 900), .5), 2.2);
  build();
}

function frame(ts) {
  if (!last) last = ts;
  const dt = Math.min((ts - last) / 1000, .05);
  last = ts;
  ctx.clearRect(0, 0, W, H);
  ctx.lineWidth = WIDTHS[cur] / 5;
  for (const p of parts) {
    p.y += p.spd * dt;
    if (p.y - p.len > H + 40) {
      p.x = rand(-60, W + 60);
      p.y = -p.len - rand(0, H * .12);
    }
    const ty = p.y - p.len;
    const g = ctx.createLinearGradient(p.x, p.y, p.x, ty);
    g.addColorStop(0, `rgba(255,255,255,0)`);
    g.addColorStop(.5, `rgba(255,255,255,${p.a.toFixed(3)})`);
    g.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, ty);
    ctx.stroke();
  }
  requestAnimationFrame(frame);
}

function setW(i) {
  cur = i;
  ui.querySelectorAll('span').forEach((s, j) => s.classList.toggle('on', j === i));
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

WIDTHS.forEach((w, i) => {
  const s = document.createElement('span');
  s.textContent = w + '';
  s.addEventListener('click', () => { setW(i); wake(); });
  ui.appendChild(s);
});

addEventListener('keydown', e => {
  const i = e.key.charCodeAt(0) - 49;
  if (i >= 0 && i < 5 && e.key.length === 1) { setW(i); wake(); }
});
addEventListener('pointermove', wake);
addEventListener('pointerdown', wake);
addEventListener('resize', resize);

resize();
setW(0);
wake();
requestAnimationFrame(frame);
