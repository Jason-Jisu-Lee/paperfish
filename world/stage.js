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
    const old = bounds;
    const nl = panelW + 20;
    bounds = { l: nl, r: Math.max(W - 50, nl + 260), t: H * 0.13, b: H * 0.8 };
    const ow = old.r - old.l, oh = old.b - old.t;
    const remap = o => {
      if (o.x === undefined || ow <= 0 || oh <= 0) return;
      o.x = bounds.l + (o.x - old.l) / ow * (bounds.r - bounds.l);
      o.y = bounds.t + (o.y - old.t) / oh * (bounds.b - bounds.t);
    };
    Game.fish.forEach(remap);
    plants.forEach(remap);
  };
  window.addEventListener('resize', resize);
  resize();

  const rand = (a, b) => a + Math.random() * (b - a);

  const pickMode = f => {
    const r = Math.random();
    if (r < 0.07) {
      f.mode = 'glide';
      f.modeT = rand(1.2, 2.8);
      f.target = rand(8, 16);
    } else if (r < 0.27) {
      f.mode = 'dart';
      f.modeT = rand(0.4, 0.9);
      f.target = rand(180, 260);
      f.vyT *= 0.5;
      f.kick = f.modeT;
      f.kickTop = f.target;
    } else {
      f.mode = 'cruise';
      f.modeT = rand(3, 7);
      f.target = rand(65, 115);
    }
  };

  const initMotion = f => {
    f.dir = Math.random() < 0.5 ? -1 : 1;
    f.spd = rand(60, 110);
    f.target = f.spd;
    f.mode = 'cruise';
    f.modeT = rand(1.5, 5);
    f.vy = 0;
    f.vyT = rand(-14, 14);
    f.turnT = rand(5, 14);
    f.kick = 0;
    f.kickTop = 0;
    f.tailPh = rand(0, Math.PI * 2);
    f.tailAmp = 0.1;
    f.slowPh = rand(0, Math.PI * 2);
    f.depth = rand(0.88, 1.14);
  };

  const materialize = (f, idx) => {
    f.x = rand(bounds.l + 50, bounds.r - 50);
    f.y = rand(bounds.t + 30, bounds.b - 30);
    f.ph = rand(0, Math.PI * 2);
    if (!f.egg) {
      const sp = SPECIES[f.s];
      if (f.age === undefined) f.age = 0;
      f.adult = !sp.adultAt || f.age >= adultAtOf(f.s);
      if (sp.hunger && !f.hungerAt) f.hungerAt = f.age + 1 + Math.random() / 6;
      initMotion(f);
      f.birth = idx === undefined ? 1 : -idx * 0.26;
    }
  };

  const hatch = f => {
    const sp = SPECIES[f.s];
    f.egg = false;
    f.t = 0;
    f.age = 0;
    f.spawned = 0;
    f.adult = !sp.adultAt;
    f.hstate = 0;
    if (sp.hunger) f.hungerAt = 1 + Math.random() / 6;
    initMotion(f);
    f.birth = 0;
  };

  const spawnPlant = center => {
    plants.push({
      x: center ? rand(0.42, 0.58) * (bounds.r - bounds.l) + bounds.l : rand(bounds.l + 60, bounds.r - 60),
      y: center ? rand(0.42, 0.58) * (bounds.b - bounds.t) + bounds.t : rand(bounds.t + 40, bounds.b - 20),
      hx: 0, hy: 0,
      ph: rand(0, Math.PI * 2),
      dph: rand(0, Math.PI * 2),
      sc: rand(0.85, 1.2),
      bites: 2
    });
  };

  const resetPlants = () => { plants.length = 0; };

  const nearestPlant = (x, y) => {
    let best = null, bd = Infinity;
    for (const p of plants) {
      if (p.bites <= 0) continue;
      const dx = p.x + p.hx - x, dy = p.y + p.hy - y;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  };

  const biteKelp = p => {
    p.bites -= 1;
    if (p.bites <= 0) p.fade = 1;
  };

  let held = null;
  const hold = f => {
    held = f;
    f.heldT = 0;
  };
  const release = () => { held = null; };
  const swirls = [];

  const pickMate = f => {
    let best = null, bd = Infinity;
    for (const o of Game.fish) {
      if (o === f || o.egg || o.dying !== undefined || o.birth < 1 || o.eating || o.court || o === held) continue;
      const d = (o.x - f.x) ** 2 + (o.y - f.y) ** 2;
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  };

  const court = (a, b) => {
    a.court = { p: b, lead: true, phase: 0, t: 0 };
    b.court = { p: a, lead: false };
  };

  const endCourt = (a, b, scurry) => {
    delete a.court;
    if (b) delete b.court;
    if (scurry) {
      escape(a, 1);
      if (b) escape(b, 1);
    }
  };

  const courtStep = (f, mdt) => {
    const c = f.court, o = c.p;
    if (!Game.fish.includes(o) || o.dying !== undefined || f.dying !== undefined) {
      endCourt(f, o, false);
      f.spawnAt = Math.min(f.spawnWin || 0, 119);
      return;
    }
    f.tailPh += mdt * Math.PI * 2 * 0.55;
    o.tailPh += mdt * Math.PI * 2 * 0.55;
    f.tailAmp += (0.28 - f.tailAmp) * Math.min(3 * mdt, 1);
    o.tailAmp += (0.28 - o.tailAmp) * Math.min(3 * mdt, 1);
    if (c.phase === 0) {
      const dx = o.x - f.x, dy = o.y - f.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = Math.min(Math.max(d * 0.8, 16), 52);
      if (Math.abs(dx) > 8) {
        f.dir = Math.sign(dx);
        o.dir = -Math.sign(dx);
      }
      f.x += (dx / d) * sp * mdt * 0.5;
      f.y += (dy / d) * sp * mdt * 0.5;
      o.x -= (dx / d) * sp * mdt * 0.5;
      o.y -= (dy / d) * sp * mdt * 0.5;
      if (d < 26) {
        c.phase = 1;
        c.T = 4 + Math.random();
        c.t = 0;
        c.cx = (f.x + o.x) / 2;
        c.cy = (f.y + o.y) / 2;
        c.drift = rand(0, Math.PI * 2);
      }
    } else {
      c.t += mdt;
      c.cx += Math.sin(c.t * 0.5 + c.drift) * 7 * mdt;
      c.cy += Math.cos(c.t * 0.4 + c.drift) * 5 * mdt;
      c.cx = Math.min(Math.max(c.cx, bounds.l + 40), bounds.r - 40);
      c.cy = Math.min(Math.max(c.cy, bounds.t + 34), bounds.b - 30);
      const ox = Math.sin(c.t * 1.05) * 11;
      const oy = Math.sin(c.t * 0.8 + 1.2) * 6;
      f.x = c.cx + ox;
      f.y = c.cy + oy;
      o.x = c.cx - ox;
      o.y = c.cy - oy * 0.7;
      f.dir = ox >= 0 ? -1 : 1;
      o.dir = -f.dir;
      if (c.t >= c.T) {
        f.courtEgg = { x: c.cx, y: c.cy };
        f.courtDone = true;
        endCourt(f, o, true);
      }
    }
  };

  const escape = (f, level) => {
    if (f.egg || f.eating || f.dying !== undefined || f.birth < 1 || f.court) return;
    swirls.push({
      x: f.x, y: f.y, t: 0,
      rot: Math.random() * Math.PI * 2,
      s: 0.8 + Math.random() * 0.5,
      spin: Math.random() < 0.5 ? -1 : 1
    });
    f.dir = Math.random() < 0.5 ? -1 : 1;
    f.spd = Math.min(240 + level * 32 + Math.random() * 150, 450);
    f.kick = 0.15 + Math.random() * 0.25;
    f.kickTop = f.spd;
    f.vyT = (Math.random() * 2 - 1) * (50 + level * 20);
    f.vy = f.vyT * 0.8;
    f.fleeT = 0.5 + Math.random() * 0.4;
    if (level >= 3) f.jukeT = 0.1 + Math.random() * 0.22;
    f.turnT = Math.max(f.turnT || 0, 2);
  };

  const flipKick = f => {
    f.kick = Math.max(f.kick, rand(0.3, 0.5));
    f.kickTop = Math.max(f.target, f.spd) * 1.05;
  };

  let tNow = 0;

  const update = mdt => {
    if (!mdt) return;
    tNow += mdt;
    for (const f of Game.fish) {
      if (f.egg) { f.ph += mdt * 2.6; continue; }
      if (f.dying !== undefined) {
        f.y -= 9 * mdt;
        f.tailPh += mdt * 1.1;
        f.tailAmp += (0 - f.tailAmp) * Math.min(4 * mdt, 1);
        continue;
      }
      if (f.birth < 1) { f.birth += mdt / 2.3; continue; }
      if (f === held) {
        f.heldT = (f.heldT || 0) + mdt;
        const calm = Math.min(f.heldT / 15, 1);
        f.tailPh += mdt * Math.PI * 2 * (2.3 - calm * 1.8);
        f.tailAmp += ((0.95 - calm * 0.83) - f.tailAmp) * Math.min(6 * mdt, 1);
        continue;
      }
      if (f.court) {
        if (f.court.lead) courtStep(f, mdt);
        continue;
      }
      if (f.eating) {
        f.tailPh += mdt * Math.PI * 2 * 0.4;
        f.tailAmp += (0.1 - f.tailAmp) * Math.min(4 * mdt, 1);
        const bx = f.eating.x + Math.sin(tNow * 6) * 2.4 * f.dir;
        f.x += (bx - f.x) * Math.min(3 * mdt, 1);
        f.y += (f.eating.y - f.y) * Math.min(3 * mdt, 1);
        continue;
      }

      if (f.fleeT > 0) f.fleeT -= mdt;
      if (f.jukeT !== undefined) {
        f.jukeT -= mdt;
        if (f.jukeT <= 0) {
          delete f.jukeT;
          if (Math.random() < 0.7) f.dir *= -1;
          f.vyT = -(f.vyT || 0) * (0.6 + Math.random() * 0.8);
        }
      }
      f.modeT -= mdt;
      if (f.modeT <= 0) pickMode(f);
      const kicking = f.kick > 0;
      if (kicking) {
        f.kick -= mdt;
        f.spd += (f.kickTop - f.spd) * Math.min(5 * mdt, 1);
      } else {
        f.spd -= f.spd * 0.22 * mdt;
        const floor = f.mode === 'glide' ? f.target : f.target * 0.82;
        if (f.spd < floor) {
          if (f.mode === 'glide') {
            f.spd = floor;
          } else {
            f.kick = rand(0.35, 0.65);
            f.kickTop = f.target * rand(1.05, 1.18);
          }
        }
      }

      const sc = Math.min(f.spd, 260);
      f.tailPh += mdt * Math.PI * 2 * (kicking ? 0.8 + Math.min(sc, 170) * 0.012 : 0.25);
      const ampT = kicking ? Math.min(0.12 + sc / 300, 0.8) : 0.05;
      f.tailAmp += (ampT - f.tailAmp) * Math.min((kicking ? 9 : 2.2) * mdt, 1);
      f.slowPh += mdt * 0.4;

      f.turnT -= mdt;
      if (f.turnT <= 0) {
        f.turnT = rand(6, 14);
        if (Math.random() < 0.4) {
          f.dir *= -1;
          flipKick(f);
        }
        f.vyT = rand(-1, 1) * (6 + f.spd * 0.16) * (Math.random() < 0.25 ? 1.8 : 1);
      }
      if (f.hstate && plants.length) {
        if (f.hstate === 2) f.dT = 0;
        else if (f.dT === undefined) f.dT = Math.random() * 3;
        else if (f.dT > 0) f.dT -= mdt;
      } else {
        f.dT = undefined;
      }
      let seeking = false;
      const target = f.hstate && f.dT !== undefined && f.dT <= 0 && !(f.fleeT > 0) ? nearestPlant(f.x, f.y) : null;
      if (target) {
        seeking = true;
        const px = Math.min(Math.max(target.x + target.hx, bounds.l + 20), bounds.r - 20);
        const pyy = Math.min(Math.max(target.y + target.hy, bounds.t + 20), bounds.b - 20);
        const dx = px - f.x;
        const dz = Math.max(18, Math.abs(pyy - f.y) * 0.35);
        if (Math.abs(dx) > dz && Math.sign(dx) !== f.dir) f.dir = Math.sign(dx);
        f.kick = 0;
        const urgent = f.hstate === 2;
        const desired = urgent
          ? Math.min(Math.max(Math.abs(dx) * 3 + 60, 130), 250)
          : Math.min(Math.max(Math.abs(dx) * 1.5 + 12, 16), 85);
        f.spd += (desired - f.spd) * Math.min((urgent ? 9 : 4) * mdt, 1);
        f.vyT = urgent
          ? Math.min(Math.max((pyy - f.y) * 1.2, -140), 140)
          : Math.min(Math.max((pyy - f.y) * 0.4, -45), 45);
      } else {
        f.schoolT = (f.schoolT || 0) - mdt;
        if (f.schoolT <= 0) {
          f.schoolT = rand(1.2, 2);
          let n = 0, cy = 0, same = 0, ax = null, ay = null, ad = Infinity;
          for (const o of Game.fish) {
            if (o === f || o.egg || o.dying !== undefined || o.s !== f.s || o.birth < 1) continue;
            const dx = o.x - f.x, dy = o.y - f.y;
            const d = dx * dx + dy * dy;
            if (d < 220 * 220) {
              n++;
              cy += o.y;
              if (o.dir === f.dir) same++;
            }
            if (!f.adult && o.adult && d < 260 * 260 && d < ad) { ad = d; ax = o.x; ay = o.y; }
          }
          if (ax !== null) {
            f.vyT = Math.min(Math.max((ay - f.y) * 0.1, -10), 10);
            if (Math.abs(ax - f.x) > 60 && Math.sign(ax - f.x) !== f.dir && Math.random() < 0.6) f.dir = Math.sign(ax - f.x);
          } else if (n >= 2) {
            f.vyT += Math.min(Math.max((cy / n - f.y) * 0.05, -6), 6);
            if (same < n * 0.3 && Math.random() < 0.5) f.dir *= -1;
          }
        }
      }
      if (!seeking) {
        const m = 50 + f.spd * 0.5;
        if (f.x < bounds.l + m && f.dir < 0) { f.dir = 1; flipKick(f); }
        if (f.x > bounds.r - m && f.dir > 0) { f.dir = -1; flipKick(f); }
      }

      if (f.y < bounds.t + 26) f.vyT = Math.abs(f.vyT) || 6;
      if (f.y > bounds.b - 26) f.vyT = -Math.abs(f.vyT) || -6;
      const vcap = seeking ? (f.hstate === 2 ? 140 : 45) : f.spd * 0.28;
      if (f.vyT > vcap) f.vyT = vcap;
      if (f.vyT < -vcap) f.vyT = -vcap;
      const dv = f.vyT - f.vy;
      const vacc = (8 + f.spd * 0.1) * mdt * (seeking ? 3 : 1);
      f.vy += Math.min(Math.max(dv, -vacc), vacc);
      const vmax = (seeking ? 50 : f.spd * 0.35) + 8;
      if (f.vy > vmax) f.vy = vmax;
      if (f.vy < -vmax) f.vy = -vmax;

      const mod = 0.95 + 0.05 * Math.sin(f.slowPh);
      f.x += f.dir * f.spd * mod * mdt;
      f.y += f.vy * mdt;
      f.x = Math.min(Math.max(f.x, bounds.l), bounds.r);
      f.y = Math.min(Math.max(f.y, bounds.t), bounds.b);
    }
    for (let i = plants.length - 1; i >= 0; i--) {
      const p = plants[i];
      p.ph += mdt * 0.55;
      p.dph += mdt * 0.11;
      p.hx = Math.sin(p.dph) * 26;
      p.hy = Math.sin(p.dph * 1.7 + 1.3) * 12;
      if (p.fade !== undefined) {
        p.fade -= mdt / 1.6;
        if (p.fade <= 0) plants.splice(i, 1);
      }
    }
    for (let i = swirls.length - 1; i >= 0; i--) {
      swirls[i].t += mdt;
      if (swirls[i].t >= 0.9) swirls.splice(i, 1);
    }
    updatePops(mdt);
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
    let grow = 1;
    const aAt = adultAtOf(f.s);
    if (aAt !== undefined) {
      const u = Math.min(Math.max(((f.age || 0) - (aAt - 0.05)) / 0.1, 0), 1);
      grow = 0.6 + 0.4 * (u * u * (3 - 2 * u));
    }
    const sc = (sp.len / sp.vb[0]) * f.depth * grow;
    const vbW = sp.vb[0], vbH = sp.vb[1];
    if (f === held) {
      const a = sp.len * 0.62 * 0.72 * (1 + Math.sin(tNow * 2.6) * 0.03);
      const k = Math.max(sp.len * 0.12, 9);
      ctx.save();
      ctx.strokeStyle = 'rgba(28,27,24,0.55)';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.x - a, f.y - a + k); ctx.lineTo(f.x - a, f.y - a); ctx.lineTo(f.x - a + k, f.y - a);
      ctx.moveTo(f.x + a - k, f.y - a); ctx.lineTo(f.x + a, f.y - a); ctx.lineTo(f.x + a, f.y - a + k);
      ctx.moveTo(f.x + a, f.y + a - k); ctx.lineTo(f.x + a, f.y + a); ctx.lineTo(f.x + a - k, f.y + a);
      ctx.moveTo(f.x - a + k, f.y + a); ctx.lineTo(f.x - a, f.y + a); ctx.lineTo(f.x - a, f.y + a - k);
      ctx.stroke();
      ctx.restore();
    }
    if (born && f.dying === undefined && !f.eating && f.hstate === 1) {
      const hx = f.x + f.dir * sp.len * 0.28;
      const hy = f.y - sp.len * 0.3 - 6 + Math.sin(tNow * 3 + f.ph) * 1.4;
      ctx.save();
      ctx.strokeStyle = 'rgba(28,27,24,0.6)';
      ctx.fillStyle = 'rgba(28,27,24,0.5)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(hx - f.dir * 6, hy + 9, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx - f.dir * 3, hy + 5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + f.dir * 2, hy - 2, 5.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx + f.dir * 2 - 1.5, hy + 0.5);
      ctx.quadraticCurveTo(hx + f.dir * 2 - 0.5, hy - 3, hx + f.dir * 2 + 1.8, hy - 4.6);
      ctx.stroke();
      ctx.restore();
    } else if (born && f.dying === undefined && !f.eating && f.hstate === 2) {
      const hx = f.x + f.dir * sp.len * 0.18;
      const hy = f.y - sp.len * 0.3 - 10;
      const pulse = 1 + Math.sin(tNow * 9) * 0.14;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = 'rgba(28,27,24,0.9)';
      ctx.fillStyle = 'rgba(28,27,24,0.9)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, -1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 3.4, 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const dying = f.dying !== undefined;
    let flipY = 1, alpha = 0.92;
    if (dying) {
      const q = Math.min(f.dying / 0.5, 1);
      flipY = 1 - 2 * (q * q * (3 - 2 * q));
      if (Math.abs(flipY) < 0.07) flipY = flipY < 0 ? -0.07 : 0.07;
      if (f.dying > 1.1) alpha = Math.max(1 - (f.dying - 1.1) / 1.6, 0) * 0.92;
    }
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.dir * sc, sc * flipY);
    ctx.translate(-vbW / 2, -vbH / 2);
    ctx.lineWidth = (1.55 * (sp.swf || 1)) / sc;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(28,27,24,' + alpha + ')';
    ctx.fillStyle = 'rgba(28,27,24,' + alpha + ')';

    if (dying) {
      if (sp.mirror) {
        ctx.save();
        ctx.translate(vbW, 0);
        ctx.scale(-1, 1);
        inkPaths(sp, null);
        ctx.restore();
      } else {
        inkPaths(sp, null);
      }
      if (sp.dots) {
        for (const d of sp.dots) {
          ctx.beginPath();
          ctx.arc(sp.mirror ? vbW - d.cx : d.cx, d.cy, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (f.dying > 0.55) {
        const ex = vbW * 0.76, ey = vbH * 0.42, r = Math.max(vbW * 0.028, 3);
        ctx.beginPath();
        ctx.moveTo(ex - r, ey - r);
        ctx.lineTo(ex + r, ey + r);
        ctx.moveTo(ex + r, ey - r);
        ctx.lineTo(ex - r, ey + r);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

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

    const amp = f.tailAmp * vbH * 0.075;
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
    const total = SPECIES[f.s].hatch ?? 60;
    const p = Math.min((f.t || 0) / total, 1);
    const q = 1 + Math.sin(f.ph * 1.15) * 0.04;
    ctx.save();
    ctx.translate(f.x, f.y + Math.sin(f.ph) * 2.2);
    ctx.scale(q, 2 - q);
    ctx.strokeStyle = 'rgba(28,27,24,0.7)';
    ctx.lineWidth = 1.55;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.2, 6.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(28,27,24,0.6)';
    ctx.beginPath();
    ctx.arc(0, 1.4, 1.1 + p * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (total - (f.t || 0) <= 5) {
      const pulse = 1 + Math.sin(tNow * 8) * 0.15;
      ctx.save();
      ctx.translate(f.x, f.y - 16);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = 'rgba(28,27,24,0.85)';
      ctx.fillStyle = 'rgba(28,27,24,0.85)';
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(0, -1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 2.6, 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawPlant = p => {
    const half = p.bites === 1;
    ctx.save();
    if (p.fade !== undefined) ctx.globalAlpha = Math.max(p.fade, 0);
    ctx.translate(p.x + p.hx, p.y + p.hy);
    ctx.scale(p.sc * (half ? 0.78 : 1), p.sc * (half ? 0.78 : 1));
    ctx.transform(1, 0, Math.sin(p.ph) * 0.16, 1, 0, 0);
    ctx.strokeStyle = 'rgba(28,27,24,0.42)';
    ctx.lineWidth = 2.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(3, -8, -4, -22, 1, -40);
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-6, -4, -4, -16, -9, -25);
    if (!half) {
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(5, -3, 8, -12, 7, -21);
    }
    ctx.stroke();
    ctx.restore();
  };

  const pops = [];
  const spawnPop = (x, y, txt, big) => {
    pops.push({ x, y, txt, t: 0, big });
  };

  const updatePops = mdt => {
    if (!mdt) return;
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i];
      p.t += mdt;
      p.y -= 17 * mdt;
      if (p.t >= 0.9) pops.splice(i, 1);
    }
  };

  const drawPops = () => {
    if (!pops.length) return;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(122,88,0,1)';
    for (const p of pops) {
      if (p.big) {
        ctx.font = '14px "Sniglet", sans-serif';
        ctx.globalAlpha = 0.9 * (1 - p.t / 0.9);
      } else {
        ctx.font = '11px "Sniglet", sans-serif';
        ctx.globalAlpha = 0.65 * (1 - p.t / 0.9);
      }
      ctx.fillText(p.txt, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  };

  const drawSwirl = s => {
    const u = s.t / 0.9;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot + u * 1.3 * s.spin);
    const sc = s.s * (1 + u * 0.4);
    ctx.scale(sc, sc);
    ctx.globalAlpha = 0.3 * (1 - u);
    ctx.strokeStyle = 'rgba(28,27,24,1)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = 0; i <= 22; i++) {
      const q = i / 22;
      const ang = q * Math.PI * 2.6;
      const r = 13 * (1 - q * 0.75);
      const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  };

  const clear = () => ctx.clearRect(0, 0, W, H);

  const drawScene = () => {
    for (const p of plants) drawPlant(p);
    for (const s of swirls) drawSwirl(s);
    for (const f of Game.fish) if (f.egg) drawEgg(f);
    for (const f of Game.fish) if (!f.egg) drawFish(f);
    drawPops();
  };

  return {
    ctx, materialize, hatch, spawnPlant, resetPlants, nearestPlant, biteKelp, hold, release, escape, pickMate, court, spawnPop, update, clear, drawScene, resize,
    get bounds() { return bounds; },
    get size() { return { W, H }; }
  };
})();
