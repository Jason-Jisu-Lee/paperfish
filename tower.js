const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const EGG = '#f0ead6';
const INK = '#2b2620';
const TAU = Math.PI * 2;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eb = k => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const rnd = (a, b) => a + Math.random() * (b - a);

const tower = { x: 0, y: 0, aim: 0, door: 0, doorUsers: 0, glow: 0, tube: 0,
  port: { users: 0, open: 0, angle: -Math.PI / 2, target: -Math.PI / 2 },
  cannon: { users: 0, hatch: 0, angle: 0, ext: 0, recoil: 0 },
  crystal: { h: 0, glow: 0, spin: 0 } };

const enemy = { x: 0, y: 0, hp: 100, max: 100, alive: true, vx: 0, vy: 0,
  dragX: 0, dragY: 0, flash: 0, poison: 0, bob: rnd(0, TAU), scale: 1, respawn: 0, pull: null };

let W = 0, H = 0;
function resize() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = W * d; canvas.height = H * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  tower.x = Math.round(W * 0.42); tower.y = Math.round(H * 0.54);
}
resize();
addEventListener('resize', resize);

const epx = () => enemy.x + enemy.dragX;
const epy = () => enemy.y + enemy.dragY;
const bearing = () => Math.atan2(epy() - tower.y, epx() - tower.x);

function placeEnemy() {
  for (let i = 0; i < 80; i++) {
    const x = rnd(80, Math.max(240, W - 420));
    const y = rnd(100, H - 90);
    const d = Math.hypot(x - tower.x, y - tower.y);
    if (d > 200 && d < 540) { enemy.x = x; enemy.y = y; return; }
  }
  enemy.x = tower.x - 250; enemy.y = tower.y - 70;
}
placeEnemy();

const fx = [], parts = [], ground = [], floats = [];
let shake = 0, flashA = 0, flashC = '255,255,255';

function spawnDot(x, y, vx, vy, life, r, color, o = {}) {
  parts.push({ type: 'dot', x, y, vx, vy, life, age: 0, r, color, drag: o.drag ?? 2.5, gy: o.gy ?? 0 });
}
function burst(x, y, n, colors, sp, r, life = 0.5) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), v = sp * rnd(0.35, 1);
    spawnDot(x, y, Math.cos(a) * v, Math.sin(a) * v, life * rnd(0.6, 1.3), r * rnd(0.6, 1.4), colors[i % colors.length]);
  }
}
function ringFx(x, y, r0, r1, dur, color, lw = 2.5) {
  parts.push({ type: 'ring', x, y, r0, r1, life: dur, age: 0, color, lw });
}
function puff(x, y, n = 3) {
  for (let i = 0; i < n; i++)
    parts.push({ type: 'puff', x: x + rnd(-9, 9), y: y + rnd(-9, 9), vx: rnd(-26, 26), vy: rnd(-30, -10), life: rnd(0.6, 1.1), age: 0, r: rnd(4.5, 9), color: '96,88,74', drag: 1 });
}
function sparkBurst(x, y, n, color) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), v = rnd(130, 340);
    parts.push({ type: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.18, 0.4), age: 0, color, drag: 4.5 });
  }
}
function spiralIn(cx, cy, color) {
  parts.push({ type: 'spiral', cx, cy, x: cx, y: cy, a: rnd(0, TAU), rad: rnd(28, 44), av: rnd(4.5, 8), rv: rnd(46, 70), life: 0.6, age: 0, r: 2.4, color });
}
function scorch(x, y, r, a = 0.13) {
  const dots = [{ x: 0, y: 0, r }];
  for (let i = 0; i < 3; i++) { const q = rnd(0, TAU); dots.push({ x: Math.cos(q) * r * 0.6, y: Math.sin(q) * r * 0.55, r: r * rnd(0.35, 0.7) }); }
  ground.push({ x, y, a, dots, life: 2.6, age: 0 });
}
function addFloat(x, y, txt, color = INK, size = 13) {
  floats.push({ x: x + rnd(-8, 8), y: y - 28, txt: String(txt), color, size, life: 0.8, age: 0 });
}

function damage(n, dir = 0, kb = 60, color = INK) {
  if (!enemy.alive) return;
  enemy.hp -= n; enemy.flash = 1;
  enemy.vx += Math.cos(dir) * kb; enemy.vy += Math.sin(dir) * kb;
  addFloat(epx(), epy(), Math.round(n), color);
  if (enemy.hp <= 0) {
    enemy.alive = false; enemy.respawn = 0.9; enemy.pull = null;
    burst(epx(), epy(), 12, ['#a394c0', '#7c6f96', INK], 170, 3.2, 0.55);
    ringFx(epx(), epy(), 6, 36, 0.45, '#a394c0');
  }
}

function seq(steps, done) {
  let i = 0, t = 0, started = false;
  const self = {
    layer: 2,
    update(dt) {
      if (i >= steps.length) return;
      const s = steps[i];
      if (!started) { started = true; t = 0; if (s.start) s.start(); }
      t += dt;
      const k = s.dur ? clamp(t / s.dur, 0, 1) : 1;
      if (s.run) s.run(k, dt);
      const fin = s.until ? s.until() : k >= 1;
      if (fin) {
        if (s.end) s.end();
        i++; started = false;
        if (i >= steps.length) { self.dead = true; if (done) { done(); done = null; } }
      }
    },
    draw() {}
  };
  return self;
}

function stick(a, kind) {
  const st = { layer: 2, age: 0, life: 1.1,
    update(dt) { st.age += dt; if (st.age > st.life || !enemy.alive) st.dead = true; },
    draw() {
      const k = st.age > 0.7 ? 1 - (st.age - 0.7) / 0.4 : 1;
      const wob = Math.sin(st.age * 26) * 0.1 * Math.exp(-st.age * 4);
      ctx.save();
      ctx.translate(epx() - Math.cos(a) * 19, epy() - Math.sin(a) * 19);
      ctx.rotate(a + wob);
      ctx.globalAlpha = clamp(k, 0, 1);
      ctx.lineCap = 'round';
      if (kind === 'bolt') {
        ctx.strokeStyle = '#51748f'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-13, 3); ctx.moveTo(-10, 0); ctx.lineTo(-13, -3);
        ctx.moveTo(-7, 0); ctx.lineTo(-10, 3); ctx.moveTo(-7, 0); ctx.lineTo(-10, -3); ctx.stroke();
      } else {
        const col = kind === 'poison' ? '#3f8a33' : INK;
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-17, 3.6); ctx.moveTo(-13, 0); ctx.lineTo(-17, -3.6);
        ctx.moveTo(-9.5, 0); ctx.lineTo(-13.5, 3.6); ctx.moveTo(-9.5, 0); ctx.lineTo(-13.5, -3.6); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    } };
  fx.push(st);
}

function arrowProj(a0, cfg) {
  const p = { layer: 2, x: tower.x + Math.cos(tower.port.angle) * 31, y: tower.y + Math.sin(tower.port.angle) * 31, a: a0, dripT: 0,
    update(dt) {
      const tx = epx(), ty = epy();
      p.a += clamp(angDiff(Math.atan2(ty - p.y, tx - p.x), p.a), -cfg.turn * dt, cfg.turn * dt);
      p.x += Math.cos(p.a) * cfg.v * dt; p.y += Math.sin(p.a) * cfg.v * dt;
      if (cfg.drip) {
        p.dripT -= dt;
        if (p.dripT <= 0) {
          p.dripT = 0.04;
          spawnDot(p.x - Math.cos(p.a) * 10, p.y - Math.sin(p.a) * 10, rnd(-14, 14), 22, 0.45, 2.1, '#4f9d3f', { drag: 0, gy: 90 });
        }
      }
      if (Math.hypot(tx - p.x, ty - p.y) < 16) { p.dead = true; cfg.hit(p); }
      if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) p.dead = true;
    },
    draw() {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.lineCap = 'round';
      cfg.shape();
      ctx.restore();
    } };
  fx.push(p);
}

function shapeArrow(col) {
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(9, 0); ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(8, 3.2); ctx.lineTo(8, -3.2); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-17, 3.6); ctx.moveTo(-13, 0); ctx.lineTo(-17, -3.6);
  ctx.moveTo(-9.5, 0); ctx.lineTo(-13.5, 3.6); ctx.moveTo(-9.5, 0); ctx.lineTo(-13.5, -3.6); ctx.stroke();
}
function shapeBolt() {
  ctx.strokeStyle = '#51748f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(6, 0); ctx.stroke();
  ctx.fillStyle = '#51748f';
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(5.5, 3); ctx.lineTo(5.5, -3); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-12, 3); ctx.moveTo(-9, 0); ctx.lineTo(-12, -3);
  ctx.moveTo(-6, 0); ctx.lineTo(-9, 3); ctx.moveTo(-6, 0); ctx.lineTo(-9, -3); ctx.stroke();
}

function drawSword(x, y, rot, sc, alpha) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.fillStyle = '#9aa4ae'; ctx.strokeStyle = '#59616a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(20, 3.2); ctx.lineTo(5, 3.2); ctx.lineTo(5, -3.2); ctx.lineTo(20, -3.2); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d9dee2'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(24, 0); ctx.stroke();
  ctx.fillStyle = '#4a4033';
  ctx.fillRect(3, -8, 3.5, 16);
  ctx.fillStyle = '#6b5842';
  ctx.fillRect(-8, -2.2, 11, 4.4);
  ctx.fillStyle = '#4a4033';
  ctx.beginPath(); ctx.arc(-9.5, 0, 3, 0, TAU); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}

function spawnFireball() {
  const p = { layer: 2, x: tower.x, y: tower.y, a: bearing(), v: 220,
    update(dt) {
      p.v = Math.min(680, p.v + 950 * dt);
      const tx = epx(), ty = epy();
      p.a += clamp(angDiff(Math.atan2(ty - p.y, tx - p.x), p.a), -4.5 * dt, 4.5 * dt);
      p.x += Math.cos(p.a) * p.v * dt; p.y += Math.sin(p.a) * p.v * dt;
      for (let i = 0; i < 2; i++)
        spawnDot(p.x - Math.cos(p.a) * 6 + rnd(-3, 3), p.y - Math.sin(p.a) * 6 + rnd(-3, 3),
          -Math.cos(p.a) * 40, -Math.sin(p.a) * 40, 0.28, 3.4, Math.random() < 0.5 ? '#ff8c2e' : '#ffc45e', { drag: 0 });
      if (Math.hypot(tx - p.x, ty - p.y) < 20) {
        p.dead = true;
        damage(18, p.a, 90);
        ringFx(p.x, p.y, 6, 40, 0.4, '#ff8c2e', 3);
        burst(p.x, p.y, 14, ['#ff8c2e', '#ffc45e', '#e05a1e'], 190, 3.4, 0.5);
        puff(p.x, p.y, 3);
        scorch(p.x, p.y, 12);
        shake = Math.max(shake, 2.5);
      }
      if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) p.dead = true;
    },
    draw() {
      const fl = 0.85 + Math.random() * 0.3;
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ff8c2e';
      ctx.beginPath(); ctx.arc(p.x, p.y, 13 * fl, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 7.5 * fl, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffe9b0';
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, TAU); ctx.fill();
    } };
  fx.push(p);
}

function boltPath(x0, y0, x1, y1, jag) {
  const pts = [[x0, y0]], n = 12;
  for (let i = 1; i < n; i++) {
    const k = i / n;
    pts.push([lerp(x0, x1, k) + rnd(-0.5, 0.5) * jag * (1 - k * 0.7), lerp(y0, y1, k) + rnd(-0.5, 0.5) * jag * 0.4]);
  }
  pts.push([x1, y1]);
  return pts;
}

function crackle() {
  const c = { layer: 2, age: 0, life: 0.55, t: 0, arcs: [],
    update(dt) {
      c.age += dt;
      if (c.age > c.life) { c.dead = true; return; }
      c.t -= dt;
      if (c.t <= 0) {
        c.t = 0.07; c.arcs = [];
        for (let i = 0; i < 3; i++) {
          const pts = []; let a = rnd(0, TAU); const r0 = rnd(13, 23);
          for (let j = 0; j < 4; j++) { pts.push([Math.cos(a) * (r0 + rnd(-4, 4)), Math.sin(a) * (r0 + rnd(-4, 4))]); a += rnd(0.5, 1); }
          c.arcs.push(pts);
        }
      }
    },
    draw() {
      const x = epx(), y = epy();
      ctx.strokeStyle = '#5b8fe0'; ctx.lineWidth = 1.4; ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.8 * (1 - c.age / c.life);
      for (const pts of c.arcs) {
        ctx.beginPath();
        pts.forEach((p, i) => i ? ctx.lineTo(x + p[0], y + p[1]) : ctx.moveTo(x + p[0], y + p[1]));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } };
  fx.push(c);
}

function strikeLightning() {
  const x1 = epx(), y1 = epy();
  const sx = x1 + rnd(-70, 70);
  const wins = [[0, 0.08, 1], [0.11, 0.19, 0.75], [0.22, 0.34, 0.45]];
  const b = { layer: 2, age: 0, wi: -1, cur: 0, pts: [], br: [],
    regen() {
      b.pts = boltPath(sx, -40, x1, y1, 52);
      b.br = [];
      for (let i = 0; i < 2; i++) {
        const s = b.pts[3 + ((Math.random() * 6) | 0)];
        b.br.push(boltPath(s[0], s[1], s[0] + rnd(-80, 80), s[1] + rnd(60, 140), 30));
      }
    },
    update(dt) {
      b.age += dt;
      if (b.age > 0.36) { b.dead = true; return; }
      const wi = wins.findIndex(w => b.age >= w[0] && b.age <= w[1]);
      if (wi >= 0 && wi !== b.wi) { b.wi = wi; b.regen(); }
      b.cur = wi >= 0 ? wins[wi][2] : 0;
    },
    draw() {
      if (!b.cur) return;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const pass = (w, col, al) => {
        ctx.lineWidth = w; ctx.strokeStyle = col; ctx.globalAlpha = al * b.cur;
        ctx.beginPath();
        b.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.stroke();
        ctx.globalAlpha = al * b.cur * 0.55;
        for (const q of b.br) {
          ctx.beginPath();
          q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.stroke();
        }
      };
      pass(9, 'rgb(110,160,255)', 0.28);
      pass(3.5, '#4f82df', 0.9);
      pass(1.4, '#ffffff', 1);
      ctx.globalAlpha = 1;
    } };
  b.regen();
  fx.push(b);
  damage(22, Math.PI / 2 + rnd(-0.5, 0.5), 40);
  flashA = 0.5; flashC = '205,220,250';
  sparkBurst(x1, y1, 11, '#4f82df');
  sparkBurst(x1, y1, 5, '#e8c63f');
  scorch(x1, y1, 10, 0.18);
  crackle();
  shake = Math.max(shake, 2);
}

function poisonCloud(x, y) {
  const bubbles = [];
  for (let i = 0; i < 5; i++)
    bubbles.push({ ox: rnd(-14, 14), oy: rnd(-12, 12), ph: rnd(0, TAU), r: rnd(5, 11), sp: rnd(3, 6) });
  const c = { layer: 2, x, y, age: 0, life: 1.8, tick: 0.45,
    update(dt) {
      c.age += dt;
      if (c.age > c.life) { c.dead = true; return; }
      c.tick -= dt;
      if (c.tick <= 0) {
        c.tick = 0.45;
        if (enemy.alive && Math.hypot(enemy.x - c.x, enemy.y - c.y) < 34) {
          enemy.poison = 0.6;
          damage(3, 0, 0, '#3f8a33');
        }
      }
    },
    draw() {
      const k = 1 - c.age / c.life;
      ctx.fillStyle = '#5aa64b';
      for (const b of bubbles) {
        ctx.globalAlpha = 0.28 * k * (0.6 + 0.4 * Math.sin(c.age * b.sp + b.ph));
        ctx.beginPath();
        ctx.arc(c.x + b.ox, c.y + b.oy - c.age * 5, b.r * (1 + c.age * 0.25), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } };
  fx.push(c);
}

function spawnBall(mx, my, a0) {
  const p = { layer: 2, x: mx, y: my, a: a0, smokeT: 0,
    update(dt) {
      const tx = epx(), ty = epy();
      p.a += clamp(angDiff(Math.atan2(ty - p.y, tx - p.x), p.a), -2 * dt, 2 * dt);
      p.x += Math.cos(p.a) * 780 * dt; p.y += Math.sin(p.a) * 780 * dt;
      p.smokeT -= dt;
      if (p.smokeT <= 0) { p.smokeT = 0.05; spawnDot(p.x, p.y, rnd(-12, 12), rnd(-12, 12), 0.35, 2.6, 'rgba(96,88,74,0.45)', { drag: 0 }); }
      if (Math.hypot(tx - p.x, ty - p.y) < 18) {
        p.dead = true;
        damage(22, p.a, 170);
        ringFx(p.x, p.y, 8, 34, 0.45, '#8d8168', 3);
        burst(p.x, p.y, 10, ['#57503f', '#8d8168'], 160, 3, 0.55);
        puff(p.x, p.y, 2);
        scorch(p.x, p.y, 11);
        shake = Math.max(shake, 4);
      }
      if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) p.dead = true;
    },
    draw() {
      ctx.fillStyle = '#26221b';
      ctx.beginPath(); ctx.arc(p.x, p.y, 7.5, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(p.x - 2.2, p.y - 2.2, 2.4, 0, TAU); ctx.fill();
    } };
  fx.push(p);
}

function spawnShell() {
  const sx = tower.x, sy = tower.y;
  const tx = epx() + rnd(-12, 12), ty = epy() + rnd(-12, 12);
  const s = { layer: 2, t: 0, dur: 0.95, spin: rnd(0, TAU),
    update(dt) {
      s.t += dt; s.spin += 5 * dt;
      if (s.t >= s.dur) {
        s.dead = true;
        ringFx(tx, ty, 10, 52, 0.5, '#e0631e', 3.5);
        ringFx(tx, ty, 4, 30, 0.35, '#ffd47e', 2);
        burst(tx, ty, 18, ['#ff8c2e', '#e0631e', '#57503f'], 230, 3.6, 0.6);
        puff(tx, ty, 4);
        scorch(tx, ty, 17, 0.2);
        shake = Math.max(shake, 5);
        if (enemy.alive && Math.hypot(enemy.x - tx, enemy.y - ty) < 48)
          damage(26, Math.atan2(enemy.y - ty, enemy.x - tx) || rnd(0, TAU), 170);
      }
    },
    draw() {
      const k = clamp(s.t / s.dur, 0, 1);
      const px = lerp(sx, tx, k), py = lerp(sy, ty, k);
      const h = Math.sin(Math.PI * k) * 95;
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath(); ctx.ellipse(px, py, 7 * (1 - h / 300), 4 * (1 - h / 300), 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(px, py - h); ctx.rotate(s.spin);
      ctx.strokeStyle = '#221f1a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * TAU;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 9.5, Math.sin(a) * 9.5); ctx.stroke();
      }
      ctx.fillStyle = '#33302a';
      ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, TAU); ctx.fill();
      if (Math.sin(s.t * 45) > 0) {
        ctx.fillStyle = '#d64545';
        ctx.beginPath(); ctx.arc(0, 0, 1.9, 0, TAU); ctx.fill();
      }
      ctx.restore();
    } };
  fx.push(s);
}

function mkBeam(ctrl) {
  const b = { layer: 2, age: 0,
    update(dt) { b.age += dt; if (ctrl.off) b.dead = true; },
    draw() {
      const x1 = epx(), y1 = epy();
      const w = 1 + 0.3 * Math.sin(b.age * 55) + Math.random() * 0.15;
      const pass = (lw, col, al) => {
        ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.globalAlpha = al; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tower.x, tower.y); ctx.lineTo(x1, y1); ctx.stroke();
      };
      pass(11 * w, '#d6336c', 0.16);
      pass(4.5 * w, '#d6336c', 0.65);
      pass(1.8, '#ffffff', 0.95);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#d6336c';
      ctx.beginPath(); ctx.arc(x1, y1, 7 + Math.random() * 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(x1, y1, 2.8, 0, TAU); ctx.fill();
    } };
  return b;
}

function mkOrb(o) {
  const m = { layer: 2, wispT: 0,
    update(dt) {
      o.age += dt;
      if (o.gone) { m.dead = true; return; }
      if (o.fly && !o.arrived) {
        const tx = epx(), ty = epy();
        const a = Math.atan2(ty - o.y, tx - o.x);
        o.x += Math.cos(a) * 240 * dt; o.y += Math.sin(a) * 240 * dt;
        m.wispT -= dt;
        if (m.wispT <= 0) {
          m.wispT = 0.04;
          spawnDot(o.x + rnd(-7, 7), o.y + rnd(-7, 7), rnd(-35, 35), rnd(-35, 35), 0.4, 2.4, '#7b5cd6', { drag: 1 });
        }
        if (Math.hypot(tx - o.x, ty - o.y) < 26) o.arrived = true;
      }
    },
    draw() {
      if (o.sc <= 0.01) return;
      const s = o.sc, pu = 1 + 0.12 * Math.sin(o.age * 7);
      ctx.save(); ctx.translate(o.x, o.y);
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#7b5cd6';
      ctx.beginPath(); ctx.arc(0, 0, 17 * s * pu, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#7b5cd6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 11.5 * s * pu, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#241d33';
      ctx.beginPath(); ctx.arc(0, 0, 7.5 * s, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(0, 0, 5 * s, o.age * 3, o.age * 3 + 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 5 * s, o.age * 3 + Math.PI, o.age * 3 + Math.PI + 2); ctx.stroke();
      ctx.restore(); ctx.globalAlpha = 1;
    } };
  return m;
}

const attacks = {
  fireball(done) {
    return seq([
      { start() { tower.doorUsers++; tower.aim = bearing(); }, dur: 0.26 },
      { dur: 0.22, run(k) { tower.glow = k; } },
      { start() { spawnFireball(); }, dur: 0.12, run(k) { tower.glow = 1 - k; }, end() { tower.doorUsers--; tower.glow = 0; } },
      { dur: 0.1 }
    ], done);
  },
  lightning(done) {
    return seq([
      { dur: 0.05 },
      { start() { strikeLightning(); }, dur: 0.5 }
    ], done);
  },
  arrow(done) {
    return seq([
      { start() { tower.port.users++; tower.port.target = bearing(); }, dur: 0.24 },
      { dur: 0.08 },
      { start() {
          arrowProj(bearing(), { v: 700, turn: 3, shape: () => shapeArrow(INK),
            hit(p) { damage(8, p.a, 70); stick(p.a, 'arrow'); burst(p.x, p.y, 4, ['#6b6154', '#8d8168'], 90, 1.8, 0.3); } });
        }, dur: 0.06 },
      { dur: 0.18, end() { tower.port.users--; } }
    ], done);
  },
  triple(done) {
    const fireBolt = off => {
      arrowProj(bearing() + off, { v: 640, turn: 7, shape: shapeBolt,
        hit(p) { damage(6, p.a, 45); stick(p.a, 'bolt'); sparkBurst(p.x, p.y, 3, '#51748f'); } });
    };
    return seq([
      { start() { tower.port.users++; tower.port.target = bearing(); }, dur: 0.24 },
      { dur: 0.05 },
      { start() { fireBolt(-0.38); }, dur: 0.07 },
      { start() { fireBolt(0); }, dur: 0.07 },
      { start() { fireBolt(0.38); }, dur: 0.07 },
      { dur: 0.16, end() { tower.port.users--; } }
    ], done);
  },
  poison(done) {
    return seq([
      { start() { tower.port.users++; tower.port.target = bearing(); }, dur: 0.24 },
      { dur: 0.08 },
      { start() {
          arrowProj(bearing(), { v: 660, turn: 3, drip: true, shape: () => shapeArrow('#3f8a33'),
            hit(p) {
              damage(7, p.a, 55, '#3f8a33');
              stick(p.a, 'poison');
              burst(p.x, p.y, 6, ['#4f9d3f', '#7dc06a'], 120, 2.6, 0.4);
              poisonCloud(p.x, p.y);
            } });
        }, dur: 0.06 },
      { dur: 0.18, end() { tower.port.users--; } }
    ], done);
  },
  sword(done) {
    const s = { x: tower.x, y: tower.y, a: 0, sc: 0, spin: 0, mode: 0, t: 0, stickA: 0 };
    const drawer = { layer: 2,
      update(dt) {
        s.t += dt;
        if (s.mode === 2) {
          s.spin += 17 * dt;
          const tx = epx(), ty = epy();
          s.a += clamp(angDiff(Math.atan2(ty - s.y, tx - s.x), s.a), -3.5 * dt, 3.5 * dt);
          s.x += Math.cos(s.a) * 540 * dt; s.y += Math.sin(s.a) * 540 * dt;
          if (Math.hypot(tx - s.x, ty - s.y) < 18) {
            s.mode = 3; s.t = 0; s.stickA = s.a;
            damage(14, s.a, 120);
            burst(s.x, s.y, 6, ['#9aa4ae', '#d9dee2'], 130, 2.4, 0.35);
          }
          if (s.x < -80 || s.x > W + 80 || s.y < -80 || s.y > H + 80) drawer.dead = true;
        }
        if (s.mode === 3 && (s.t > 1.05 || !enemy.alive)) drawer.dead = true;
      },
      draw() {
        if (s.mode === 0) return;
        if (s.mode === 1) drawSword(s.x, s.y, s.a, s.sc, 1);
        else if (s.mode === 2) drawSword(s.x, s.y, s.spin, 1, 1);
        else {
          const al = s.t > 0.65 ? Math.max(0, 1 - (s.t - 0.65) / 0.4) : 1;
          const wob = Math.sin(s.t * 22) * 0.09 * Math.exp(-s.t * 3.5);
          drawSword(epx() - Math.cos(s.stickA) * 21, epy() - Math.sin(s.stickA) * 21, s.stickA + wob, 1, al);
        }
      } };
    fx.push(drawer);
    return seq([
      { start() { tower.doorUsers++; tower.aim = bearing(); }, dur: 0.26 },
      { start() { s.mode = 1; }, dur: 0.28, run(k) { s.sc = eb(k); s.a = bearing() + (1 - eo(k)) * 2.2; } },
      { start() { s.mode = 2; s.t = 0; s.spin = s.a; }, dur: 0.12, end() { tower.doorUsers--; } }
    ], done);
  },
  cannon(done) {
    return seq([
      { start() { tower.cannon.users++; tower.cannon.angle = bearing(); }, dur: 0.2 },
      { dur: 0.24, run(k) { tower.cannon.ext = eo(k); } },
      { start() {
          const a = tower.cannon.angle;
          const mx = tower.x + Math.cos(a) * 66, my = tower.y + Math.sin(a) * 66;
          spawnBall(mx, my, a);
          sparkBurst(mx, my, 6, '#e8a13f');
          burst(mx, my, 4, ['#ffd47e', '#ff8c2e'], 140, 2.6, 0.25);
          puff(mx, my, 3);
          tower.cannon.recoil = 8;
          shake = Math.max(shake, 3);
        }, dur: 0.12 },
      { dur: 0.18 },
      { dur: 0.2, run(k) { tower.cannon.ext = 1 - eio(k); } },
      { end() { tower.cannon.users--; } }
    ], done);
  },
  mortar(done) {
    return seq([
      { start() { tower.doorUsers++; tower.aim = bearing(); }, dur: 0.28 },
      { dur: 0.22, run(k) { tower.tube = eo(k); } },
      { start() {
          spawnShell();
          ringFx(tower.x, tower.y, 4, 22, 0.3, '#8d8168', 2.5);
          puff(tower.x, tower.y, 2);
          shake = Math.max(shake, 2);
        }, dur: 0.25 },
      { dur: 0.22, run(k) { tower.tube = 1 - k; }, end() { tower.doorUsers--; } }
    ], done);
  },
  laser(done) {
    const ctrl = {};
    let tick = 0, conv = 0;
    return seq([
      { start() { tower.doorUsers++; tower.aim = bearing(); }, dur: 0.26 },
      { dur: 0.22, run(k) { tower.crystal.h = eb(k); } },
      { dur: 0.5, run(k, dt) {
          tower.crystal.glow = k;
          conv -= dt;
          if (conv <= 0) {
            conv = 0.045;
            const a = rnd(0, TAU);
            spawnDot(tower.x + Math.cos(a) * 34, tower.y + Math.sin(a) * 34, -Math.cos(a) * 115, -Math.sin(a) * 115, 0.29, 2.2, '#d6336c', { drag: 0 });
          }
        } },
      { start() { fx.push(mkBeam(ctrl)); }, dur: 0.55, run(k, dt) {
          tick -= dt;
          if (tick <= 0) {
            tick = 0.13;
            damage(6, bearing(), 22, '#d6336c');
            sparkBurst(epx(), epy(), 3, '#d6336c');
          }
        }, end() { ctrl.off = true; tower.crystal.glow = 0; } },
      { dur: 0.2, run(k) { tower.crystal.h = 1 - k; }, end() { tower.doorUsers--; } }
    ], done);
  },
  'void': function (done) {
    const o = { x: tower.x, y: tower.y, sc: 0, age: 0, fly: false, arrived: false, gone: false, swT: 0 };
    fx.push(mkOrb(o));
    return seq([
      { start() { tower.doorUsers++; tower.aim = bearing(); }, dur: 0.26 },
      { dur: 0.24, run(k) { o.sc = eb(k); } },
      { start() { o.fly = true; tower.doorUsers--; }, until: () => o.arrived },
      { dur: 0.7, run(k, dt) {
          o.swT -= dt;
          if (o.swT <= 0) { o.swT = 0.05; spiralIn(o.x, o.y, '#7b5cd6'); }
          if (enemy.alive) enemy.pull = o;
        } },
      { dur: 0.13, run(k) { o.sc = 1 - k; },
        end() {
          enemy.pull = null; o.gone = true;
          if (enemy.alive && Math.hypot(enemy.x - o.x, enemy.y - o.y) < 46)
            damage(30, Math.atan2(enemy.y - o.y, enemy.x - o.x) || rnd(0, TAU), 90, '#7b5cd6');
          burst(o.x, o.y, 12, ['#7b5cd6', '#4a3a78', '#b49ae8'], 210, 3, 0.5);
          ringFx(o.x, o.y, 5, 46, 0.45, '#7b5cd6', 2.5);
          shake = Math.max(shake, 3);
        } }
    ], done);
  }
};

const locks = {};
const btns = {};
document.querySelectorAll('#panel button').forEach(b => {
  btns[b.dataset.a] = b;
  b.addEventListener('click', () => fire(b.dataset.a));
});
function fire(type) {
  if (locks[type] || !attacks[type]) return;
  locks[type] = true;
  const b = btns[type];
  if (b) b.classList.add('busy');
  fx.push(attacks[type](() => { locks[type] = false; if (b) b.classList.remove('busy'); }));
}
window.fire = fire;

const keyMap = { Digit1: 'fireball', Digit2: 'lightning', Digit3: 'arrow', Digit4: 'triple', Digit5: 'poison',
  Digit6: 'sword', Digit7: 'cannon', Digit8: 'mortar', Digit9: 'laser', Digit0: 'void' };
addEventListener('keydown', e => { const a = keyMap[e.code]; if (a) fire(a); });

const auto = new URLSearchParams(location.search).get('auto');
if (auto) setTimeout(() => fire(auto), 120);

function stepTower(dt) {
  const t = tower, e = 1 - Math.exp(-10 * dt);
  t.door = lerp(t.door, t.doorUsers > 0 ? 1 : 0, e);
  t.port.open = lerp(t.port.open, t.port.users > 0 ? 1 : 0, e);
  t.port.angle += angDiff(t.port.target, t.port.angle) * (1 - Math.exp(-8 * dt));
  t.cannon.hatch = lerp(t.cannon.hatch, t.cannon.users > 0 ? 1 : 0, e);
  t.cannon.recoil *= Math.exp(-9 * dt);
  t.crystal.spin += dt * (0.8 + t.crystal.glow * 6);
}

function stepEnemy(dt) {
  enemy.bob += dt * 3.1;
  enemy.flash = Math.max(0, enemy.flash - dt * 5);
  enemy.poison = Math.max(0, enemy.poison - dt);
  const dr = Math.exp(-6 * dt);
  enemy.vx *= dr; enemy.vy *= dr;
  enemy.x += enemy.vx * dt; enemy.y += enemy.vy * dt;
  enemy.x = clamp(enemy.x, 50, W - 240); enemy.y = clamp(enemy.y, 60, H - 50);
  if (enemy.pull && enemy.alive && Math.hypot(enemy.pull.x - enemy.x, enemy.pull.y - enemy.y) < 90) {
    const dx = enemy.pull.x - enemy.x, dy = enemy.pull.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1, m = Math.min(13, d * 0.45);
    const k = 1 - Math.exp(-5 * dt);
    enemy.dragX = lerp(enemy.dragX, dx / d * m, k);
    enemy.dragY = lerp(enemy.dragY, dy / d * m, k);
  } else {
    const r = Math.exp(-9 * dt);
    enemy.dragX *= r; enemy.dragY *= r;
  }
  if (!enemy.alive) {
    enemy.respawn -= dt;
    if (enemy.respawn <= 0) {
      placeEnemy();
      enemy.hp = enemy.max; enemy.alive = true; enemy.scale = 0;
      enemy.vx = enemy.vy = enemy.dragX = enemy.dragY = 0;
      ringFx(enemy.x, enemy.y, 4, 26, 0.4, '#a394c0', 2);
    }
  }
  enemy.scale = lerp(enemy.scale, 1, 1 - Math.exp(-8 * dt));
}

function stepParts(dt) {
  for (const p of parts) {
    p.age += dt;
    if (p.type === 'spiral') {
      p.a += p.av * dt;
      p.rad = Math.max(2, p.rad - p.rv * dt);
      p.x = p.cx + Math.cos(p.a) * p.rad;
      p.y = p.cy + Math.sin(p.a) * p.rad;
      continue;
    }
    if (p.type === 'ring') continue;
    const dr = Math.exp(-(p.drag ?? 0) * dt);
    p.vx *= dr; p.vy *= dr;
    p.vy += (p.gy ?? 0) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}

function drawParts() {
  for (const p of parts) {
    const k = 1 - p.age / p.life;
    if (k <= 0) continue;
    if (p.type === 'dot' || p.type === 'spiral') {
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.r * (0.35 + 0.65 * k)), 0, TAU); ctx.fill();
    } else if (p.type === 'ring') {
      const rr = lerp(p.r0, p.r1, eo(p.age / p.life));
      ctx.globalAlpha = k;
      ctx.strokeStyle = p.color; ctx.lineWidth = p.lw * (0.5 + 0.5 * k);
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.stroke();
    } else if (p.type === 'puff') {
      ctx.globalAlpha = 0.2 * k;
      ctx.fillStyle = `rgb(${p.color})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + p.age * 2), 0, TAU); ctx.fill();
    } else if (p.type === 'spark') {
      ctx.globalAlpha = k;
      ctx.strokeStyle = p.color; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function drawGround() {
  for (const g of ground) {
    const k = 1 - g.age / g.life;
    ctx.fillStyle = `rgba(52,42,30,${(g.a * k).toFixed(3)})`;
    for (const d of g.dots) {
      ctx.beginPath(); ctx.ellipse(g.x + d.x, g.y + d.y, d.r, d.r * 0.8, 0, 0, TAU); ctx.fill();
    }
  }
}

function drawFloats() {
  ctx.textAlign = 'center';
  for (const f of floats) {
    const k = f.age / f.life;
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = f.color;
    ctx.font = `700 ${f.size}px ui-monospace, Consolas, monospace`;
    ctx.fillText(f.txt, f.x, f.y - eo(k) * 24);
  }
  ctx.globalAlpha = 1;
}

function drawEnemy() {
  if (!enemy.alive) return;
  const x = epx(), y = epy();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath(); ctx.ellipse(x, y + 14, 13 * enemy.scale, 4.5 * enemy.scale, 0, 0, TAU); ctx.fill();
  const b = Math.sin(enemy.bob) * 0.05;
  ctx.save(); ctx.translate(x, y);
  ctx.scale(enemy.scale * (1 - b * 0.7), enemy.scale * (1 + b));
  ctx.fillStyle = '#a394c0'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(-5.5, -3, 2.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(5.5, -3, 2.3, 0, TAU); ctx.fill();
  if (enemy.poison > 0) {
    ctx.globalAlpha = Math.min(0.4, enemy.poison);
    ctx.fillStyle = '#4f9d3f';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
  }
  if (enemy.flash > 0) {
    ctx.globalAlpha = enemy.flash * 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
  }
  ctx.restore(); ctx.globalAlpha = 1;
  const pct = clamp(enemy.hp / enemy.max, 0, 1);
  ctx.fillStyle = EGG; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x - 23, y - 37, 46, 7, 3.5); ctx.fill(); ctx.stroke();
  if (pct > 0) {
    ctx.fillStyle = pct > 0.5 ? '#63a24e' : pct > 0.25 ? '#d9922e' : '#c4463a';
    ctx.beginPath(); ctx.roundRect(x - 21, y - 35, 42 * pct, 3, 1.5); ctx.fill();
  }
}

function drawTower() {
  const t = tower, x = t.x, y = t.y, c = t.cannon;
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath(); ctx.ellipse(x + 6, y + 9, 52, 50, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#dbd3bd'; ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(x, y, 50, 0, TAU); ctx.fill(); ctx.stroke();
  if (c.hatch > 0.02) {
    ctx.strokeStyle = '#221e17'; ctx.lineWidth = 13; ctx.globalAlpha = c.hatch * 0.92;
    ctx.beginPath(); ctx.arc(x, y, 43.5, c.angle - 0.26, c.angle + 0.26); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    let al = 1;
    if (c.hatch > 0.02 && Math.abs(angDiff(a, c.angle)) < 0.34) al = 1 - c.hatch;
    if (al < 0.03) continue;
    ctx.save(); ctx.translate(x + Math.cos(a) * 43.5, y + Math.sin(a) * 43.5); ctx.rotate(a);
    ctx.globalAlpha = al;
    ctx.fillStyle = '#cdc4ab'; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.rect(-4.5, -6.5, 9, 13); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  if (c.ext > 0.03) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(c.angle);
    const L = 36 + 30 * c.ext - c.recoil;
    ctx.strokeStyle = '#453f34'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(32, 0); ctx.lineTo(L, 0); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(L - 8, -5.5); ctx.lineTo(L - 8, 5.5); ctx.stroke();
    ctx.fillStyle = '#171410';
    ctx.beginPath(); ctx.arc(L, 0, 4.2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#e7e0cb'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 31, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(43,38,32,0.15)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, 26.5, 0, TAU); ctx.stroke();
  const p = t.port;
  ctx.save();
  ctx.translate(x + Math.cos(p.angle) * 21.5, y + Math.sin(p.angle) * 21.5);
  ctx.rotate(p.angle);
  if (p.open > 0.02) {
    ctx.fillStyle = '#171410';
    ctx.fillRect(-3, -4, 11, 8 * p.open);
  }
  ctx.fillStyle = '#e7e0cb';
  ctx.fillRect(-3, -4 + 8 * p.open, 11, 8 * (1 - p.open));
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.35 + p.open * 0.65;
  ctx.strokeRect(-3, -4, 11, 8);
  ctx.restore(); ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(t.aim);
  ctx.fillStyle = '#171410';
  ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, TAU); ctx.fill();
  if (t.glow > 0.02) {
    ctx.globalAlpha = t.glow * 0.6;
    ctx.fillStyle = '#ff8c2e';
    ctx.beginPath(); ctx.arc(0, 0, 11.5, 0, TAU); ctx.fill();
    ctx.globalAlpha = t.glow * 0.55;
    ctx.fillStyle = '#ffd47e';
    ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (t.tube > 0.02) {
    ctx.strokeStyle = '#5a5244'; ctx.lineWidth = 3; ctx.globalAlpha = t.tube;
    ctx.beginPath(); ctx.arc(0, 0, 8.5 * t.tube, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const d = t.door;
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, TAU); ctx.clip();
  ctx.fillStyle = '#e7e0cb'; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(0, -14.2 * d, 13.8, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 14.2 * d, 13.8, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, TAU); ctx.stroke();
  ctx.restore();
  const cr = t.crystal;
  if (cr.h > 0.02) {
    const s = 9 * cr.h;
    ctx.save(); ctx.translate(x, y); ctx.rotate(cr.spin);
    const pulse = 1.6 + 0.3 * Math.sin(cr.spin * 4);
    const dia = (sz) => {
      ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.7, 0); ctx.lineTo(0, sz); ctx.lineTo(-sz * 0.7, 0); ctx.closePath();
    };
    ctx.globalAlpha = 0.1 + cr.glow * 0.3;
    ctx.fillStyle = '#d6336c';
    dia(s * pulse); ctx.fill();
    ctx.globalAlpha = 1;
    dia(s); ctx.fill();
    ctx.strokeStyle = '#8f1f49'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#ffd7e4';
    dia(s * 0.38); ctx.fill();
    ctx.restore();
  }
}

function update(dt) {
  stepTower(dt);
  stepEnemy(dt);
  for (const f of fx) f.update(dt);
  for (let i = fx.length - 1; i >= 0; i--) if (fx[i].dead) fx.splice(i, 1);
  stepParts(dt);
  for (let i = parts.length - 1; i >= 0; i--) if (parts[i].age >= parts[i].life) parts.splice(i, 1);
  for (const g of ground) g.age += dt;
  for (let i = ground.length - 1; i >= 0; i--) if (ground[i].age >= ground[i].life) ground.splice(i, 1);
  for (const f of floats) f.age += dt;
  for (let i = floats.length - 1; i >= 0; i--) if (floats[i].age >= floats[i].life) floats.splice(i, 1);
  shake *= Math.exp(-7 * dt);
  if (shake < 0.05) shake = 0;
  flashA = Math.max(0, flashA - dt * 3.5);
}

function render() {
  ctx.fillStyle = EGG;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  if (shake > 0) ctx.translate(rnd(-1, 1) * shake, rnd(-1, 1) * shake);
  drawGround();
  drawEnemy();
  drawTower();
  for (const f of fx) f.draw();
  drawParts();
  drawFloats();
  ctx.restore();
  if (flashA > 0) {
    ctx.fillStyle = `rgba(${flashC},${flashA.toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
