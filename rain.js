const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');

let W = 0, H = 0, dpr = 1, k = 1, area = 1;
let parts = [], cur = 0, t = 0, last = 0, hideTimer = 0;

const STYLES = [
  {name: 'fine',  n: 170, spd: [520, 900],   exp: .035, w: [1, 1],    al: [.22, .50], sway: 0, glow: 0, rgb: '255,255,255', ang: () => 0},
  {name: 'depth', layers: [
    {n: 130, spd: [260, 340],  exp: .030, w: [1, 1],     al: [.10, .16]},
    {n: 80,  spd: [520, 640],  exp: .035, w: [1, 1],     al: [.22, .32]},
    {n: 36,  spd: [980, 1180], exp: .040, w: [1.6, 1.6], al: [.45, .62]}
  ], sway: 0, glow: 0, rgb: '255,255,255', ang: () => 0},
  {name: 'mist',  n: 330, spd: [130, 240],   exp: .050, w: [1, 1],    al: [.08, .20], sway: 9, glow: 0, rgb: '255,255,255', ang: () => 0},
  {name: 'storm', n: 240, spd: [1050, 1500], exp: .045, w: [1, 1.4],  al: [.18, .50], sway: 0, glow: 0, rgb: '255,255,255', ang: tt => .20 + Math.sin(tt * .13) * .05 + Math.sin(tt * .047 + 1.7) * .08},
  {name: 'glow',  n: 120, spd: [420, 700],   exp: .045, w: [1, 1],    al: [.35, .60], sway: 0, glow: 1, rgb: '155,225,255', ang: () => 0}
];

const rand = (a, b) => a + Math.random() * (b - a);

function mk(c, st) {
  const spd = rand(c.spd[0], c.spd[1]) * k;
  const a = rand(c.al[0], c.al[1]);
  return {
    x: rand(-60, W + 60),
    y: rand(-H * .1, H),
    spd,
    len: spd * c.exp,
    w: rand(c.w[0], c.w[1]),
    ph: rand(0, Math.PI * 2),
    col: `rgba(${st.rgb},${a.toFixed(3)})`,
    halo: `rgba(${st.rgb},${(a * .28).toFixed(3)})`
  };
}

function build() {
  const st = STYLES[cur];
  parts = [];
  const layers = st.layers || [{n: st.n, spd: st.spd, exp: st.exp, w: st.w, al: st.al}];
  for (const c of layers) {
    const n = Math.round(c.n * area);
    for (let i = 0; i < n; i++) parts.push(mk(c, st));
  }
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

function respawn(p) {
  p.x = rand(-60, W + 60);
  p.y = -p.len - rand(0, H * .12);
}

function frame(ts) {
  if (!last) last = ts;
  const dt = Math.min((ts - last) / 1000, .05);
  last = ts;
  t += dt;
  ctx.clearRect(0, 0, W, H);
  const st = STYLES[cur];
  const ang = st.ang(t);
  const dx = Math.sin(ang);
  const dy = Math.cos(ang);
  for (const p of parts) {
    p.x += p.spd * dx * dt;
    p.y += p.spd * dy * dt;
    if (st.sway) p.x += Math.sin(t * .5 + p.ph) * st.sway * dt;
    if (p.y - p.len > H + 40) respawn(p);
    if (p.x > W + 70) p.x -= W + 140;
    else if (p.x < -70) p.x += W + 140;
    const x2 = p.x - dx * p.len;
    const y2 = p.y - dy * p.len;
    if (st.glow) {
      ctx.strokeStyle = p.halo;
      ctx.lineWidth = p.w + 2.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.strokeStyle = p.col;
    ctx.lineWidth = p.w;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  requestAnimationFrame(frame);
}

function setStyle(i) {
  cur = i;
  build();
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

STYLES.forEach((st, i) => {
  const s = document.createElement('span');
  s.textContent = (i + 1) + ' ' + st.name;
  s.addEventListener('click', () => { setStyle(i); wake(); });
  ui.appendChild(s);
});

addEventListener('keydown', e => {
  const i = e.key.charCodeAt(0) - 49;
  if (i >= 0 && i < STYLES.length && e.key.length === 1) { setStyle(i); wake(); }
});
addEventListener('pointermove', wake);
addEventListener('pointerdown', wake);
addEventListener('resize', resize);

resize();
setStyle(0);
wake();
requestAnimationFrame(frame);
