const Stage = (() => {
  const canvas = document.getElementById('sea');
  const ctx = canvas.getContext('2d');
  const plants = [];
  const SLICES = 18;
  let W = 0, H = 0, bounds = { l: 60, r: 600, t: 80, b: 500 };

  const measure = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', 0);
    svg.setAttribute('height', 0);
    svg.style.position = 'absolute';
    document.body.appendChild(svg);
    for (const sp of SPECIES) {
      sp.p2d = sp.paths.map(d => new Path2D(d));
      sp.plen = sp.paths.map(d => {
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', d);
        svg.appendChild(p);
        return p.getTotalLength();
      });
    }
    svg.remove();
  };
  measure();

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hud = document.getElementById('hud');
    const panelW = hud && !hud.hidden ? hud.getBoundingClientRect().width + 48 : Math.min(320, W * 0.28) + 48;
    bounds = { l: 50, r: Math.max(W - panelW - 40, 260), t: H * 0.13, b: H * 0.8 };
    for (const f of Game.fish) {
      if (f.x !== undefined) {
        f.x = Math.min(Math.max(f.x, bounds.l), bounds.r);
        f.y = Math.min(Math.max(f.y, bounds.t), bounds.b);
      }
    }
  };
  window.addEventListener('resize', resize);
  resize();

  const rand = (a, b) => a + Math.random() * (b - a);

  const pickMode = f => {
    const r = Math.random();
    if (r < 0.07) {
      f.mode = 'glide';
      f.modeT = rand(1.2, 2.8);
      f.target = rand(6, 12);
    } else if (r < 0.27) {
      f.mode = 'dart';
      f.modeT = rand(0.5, 1);
      f.target = rand(130, 200);
      f.vyT *= 0.3;
    } else {
      f.mode = 'cruise';
      f.modeT = rand(3, 7);
      f.target = rand(45, 85);
    }
  };

  const initMotion = f => {
    f.dir = Math.random() < 0.5 ? -1 : 1;
    f.spd = rand(45, 80);
    f.target = f.spd;
    f.mode = 'cruise';
    f.modeT = rand(1.5, 5);
    f.vy = 0;
    f.vyT = rand(-6, 6);
    f.turnT = rand(5, 14);
    f.turn = null;
    f.flipped = false;
    f.w = 1;
    f.tailPh = rand(0, Math.PI * 2);
    f.tailAmp = 0.4;
    f.slowPh = rand(0, Math.PI * 2);
    f.depth = rand(0.88, 1.14);
  };

  const materialize = (f, idx) => {
    f.x = rand(bounds.l + 50, bounds.r - 50);
    f.y = rand(bounds.t + 30, bounds.b - 30);
    f.ph = rand(0, Math.PI * 2);
    if (!f.egg) {
      initMotion(f);
      f.birth = idx === undefined ? 0 : -idx * 0.26;
    }
  };

  const hatch = f => {
    f.egg = false;
    f.t = 0;
    initMotion(f);
    f.birth = 0;
  };

  const spawnPlant = () => {
    plants.push({
      x: rand(bounds.l + 60, bounds.r - 60),
      y: rand(bounds.t + 40, bounds.b - 20),
      hx: 0, hy: 0,
      ph: rand(0, Math.PI * 2),
      dph: rand(0, Math.PI * 2),
      sc: rand(0.85, 1.2)
    });
  };

  const resetPlants = () => { plants.length = 0; };

  const startTurn = f => {
    if (f.turn === null) {
      f.turn = 0;
      f.flipped = false;
    }
  };

  const update = mdt => {
    if (!mdt) return;
    for (const f of Game.fish) {
      if (f.egg) { f.ph += mdt * 2.6; continue; }
      if (f.birth < 1) { f.birth += mdt / 2.3; continue; }

      f.modeT -= mdt;
      if (f.modeT <= 0) pickMode(f);
      const acc = f.mode === 'dart' ? 5.5 : 2.4;
      f.spd += (f.target - f.spd) * Math.min(acc * mdt, 1);

      const sc = Math.min(f.spd, 200);
      f.tailPh += mdt * Math.PI * 2 * (0.55 + Math.min(sc, 150) * 0.016);
      const ampT = f.turn !== null ? 0.3 : Math.min(0.18 + sc / 110, 1.25);
      f.tailAmp += (ampT - f.tailAmp) * Math.min(3 * mdt, 1);
      f.slowPh += mdt * 0.4;

      if (f.turn !== null) {
        f.turn += mdt / 0.55;
        if (f.turn >= 0.5 && !f.flipped) {
          f.dir *= -1;
          f.flipped = true;
        }
        if (f.turn >= 1) {
          f.turn = null;
          f.flipped = false;
          f.w = 1;
        } else {
          f.w = Math.max(Math.abs(Math.cos(Math.PI * f.turn)), 0.08);
        }
      } else {
        f.turnT -= mdt;
        if (f.turnT <= 0) {
          f.turnT = rand(7, 16);
          if (Math.random() < 0.45) startTurn(f);
          else f.vyT = rand(-10, 10);
        }
        const m = 50 + f.spd * 0.6;
        if (f.x < bounds.l + m && f.dir < 0) startTurn(f);
        if (f.x > bounds.r - m && f.dir > 0) startTurn(f);
      }

      if (f.y < bounds.t + 26) f.vyT = Math.abs(f.vyT) || 4;
      if (f.y > bounds.b - 26) f.vyT = -Math.abs(f.vyT) || -4;
      const dv = f.vyT - f.vy;
      f.vy += Math.min(Math.max(dv, -10 * mdt), 10 * mdt);

      const mv = f.turn !== null ? 0.25 + 0.75 * f.w : 1;
      const mod = 0.88 + 0.18 * Math.sin(f.slowPh);
      f.x += f.dir * f.spd * mod * mv * mdt;
      f.y += f.vy * mdt;
      f.x = Math.min(Math.max(f.x, bounds.l), bounds.r);
      f.y = Math.min(Math.max(f.y, bounds.t), bounds.b);
    }
    for (const p of plants) {
      p.ph += mdt * 0.55;
      p.dph += mdt * 0.11;
      p.hx = Math.sin(p.dph) * 26;
      p.hy = Math.sin(p.dph * 1.7 + 1.3) * 12;
    }
  };

  const ease = q => q <= 0 ? 0 : q >= 1 ? 1 : q * q * (3 - 2 * q);

  const inkPaths = (sp, dashProgress) => {
    for (let i = 0; i < sp.p2d.length; i++) {
      if (dashProgress === null) {
        ctx.stroke(sp.p2d[i]);
      } else {
        const q = ease(Math.min(Math.max(dashProgress * 1.7 - i * 0.24, 0), 1));
        if (q <= 0) continue;
        ctx.setLineDash([sp.plen[i]]);
        ctx.lineDashOffset = sp.plen[i] * (1 - q);
        ctx.stroke(sp.p2d[i]);
        ctx.setLineDash([]);
      }
    }
  };

  const drawFish = f => {
    const sp = SPECIES[f.s];
    const born = f.birth >= 1;
    const sc = (sp.len / sp.vb[0]) * f.depth;
    const vbW = sp.vb[0], vbH = sp.vb[1];
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.dir * sc * (born ? f.w : 1), sc);
    ctx.translate(-vbW / 2, -vbH / 2);
    ctx.lineWidth = sp.sw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(28,27,24,0.92)';
    ctx.fillStyle = 'rgba(28,27,24,0.92)';

    if (!born) {
      if (sp.mirror) {
        ctx.translate(vbW, 0);
        ctx.scale(-1, 1);
      }
      inkPaths(sp, Math.max(f.birth, 0));
      if (sp.dots && f.birth > 0.7) {
        for (const d of sp.dots) {
          ctx.beginPath();
          ctx.arc(d.cx, d.cy, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    const amp = f.tailAmp * vbH * 0.085;
    const sw = vbW / SLICES;
    for (let i = 0; i < SLICES; i++) {
      const x0 = i * sw;
      const u = (x0 + sw / 2) / vbW;
      const env = Math.pow(1 - u, 1.5) * 0.9 + 0.06;
      const dy = amp * env * Math.sin(f.tailPh + u * 5.4);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0 - 0.25, -vbH * 0.6, sw + 0.5, vbH * 2.2);
      ctx.clip();
      ctx.translate(0, dy);
      if (sp.mirror) {
        ctx.translate(vbW, 0);
        ctx.scale(-1, 1);
      }
      inkPaths(sp, null);
      if (sp.dots) {
        for (const d of sp.dots) {
          ctx.beginPath();
          ctx.arc(d.cx, d.cy, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  };

  const drawEgg = f => {
    ctx.save();
    ctx.translate(f.x, f.y + Math.sin(f.ph) * 2.4);
    ctx.strokeStyle = 'rgba(28,27,24,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.2, 6.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawPlant = p => {
    ctx.save();
    ctx.translate(p.x + p.hx, p.y + p.hy);
    ctx.scale(p.sc, p.sc);
    ctx.transform(1, 0, Math.sin(p.ph) * 0.16, 1, 0, 0);
    ctx.strokeStyle = 'rgba(28,27,24,0.42)';
    ctx.lineWidth = 2.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(3, -8, -4, -22, 1, -40);
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-6, -4, -4, -16, -9, -25);
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(5, -3, 8, -12, 7, -21);
    ctx.stroke();
    ctx.restore();
  };

  const clear = () => ctx.clearRect(0, 0, W, H);

  const drawScene = () => {
    for (const p of plants) drawPlant(p);
    for (const f of Game.fish) if (f.egg) drawEgg(f);
    for (const f of Game.fish) if (!f.egg) drawFish(f);
  };

  return {
    ctx, materialize, hatch, spawnPlant, resetPlants, update, clear, drawScene, resize,
    get bounds() { return bounds; },
    get size() { return { W, H }; }
  };
})();
