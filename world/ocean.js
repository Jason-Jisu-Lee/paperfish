const Ocean = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const INK = a => `rgba(28,27,24,${a})`;
  const puffs = [];
  const grass = [];
  let clam = null, snail = null, jelly = null;
  let nextJelly = 0, nextPearl = 0, tNow = 0;

  const fy = () => Stage.size.H * 0.93;
  const xAt = u => { const b = Stage.bounds; return b.l + u * (b.r - b.l); };

  const puff = (x, y, n) => {
    for (let i = 0; i < n; i++) puffs.push({
      x: x + rand(-4, 4), y, r: rand(1.2, 2.6),
      vy: rand(45, 75), ph: rand(0, 7), a: rand(0.18, 0.3), t: 0
    });
  };

  const start = () => {
    grass.length = 0;
    grass.push({ u: rand(0.16, 0.28), imp: 0, seed: rand(0, 7) });
    grass.push({ u: rand(0.6, 0.74), imp: 0, seed: rand(0, 7) });
    clam = { u: rand(0.38, 0.52), open: 0, opening: true, phase: rand(2, 5), pearl: false };
    snail = { u: rand(0.78, 0.88), dir: -1, hideT: 0 };
    jelly = null;
    nextJelly = rand(20, 50);
    nextPearl = rand(60, 100);
    puffs.length = 0;
  };

  const spawnJelly = () => {
    const b = Stage.bounds;
    const ltr = Math.random() < 0.5;
    jelly = {
      x: ltr ? b.l - 40 : b.r + 40,
      dir: ltr ? 1 : -1,
      baseY: rand(b.t + 50, b.t + (b.b - b.t) * 0.45),
      vy: 0, squash: 1, ph: rand(0, 7)
    };
    jelly.y = jelly.baseY;
  };

  const update = mdt => {
    if (!Game.started || !clam || !mdt) return;
    tNow += mdt;
    const b = Stage.bounds;

    clam.phase -= mdt;
    if (clam.phase <= 0) { clam.opening = !clam.opening; clam.phase = clam.opening ? rand(3, 6) : rand(2, 4); }
    const target = clam.pearl ? 0.6 : clam.opening ? 0.42 + Math.sin(tNow * 1.3) * 0.05 : 0.02;
    clam.open += (target - clam.open) * Math.min(3 * mdt, 1);
    if (!clam.pearl) {
      nextPearl -= mdt;
      if (nextPearl <= 0) clam.pearl = true;
      if (clam.opening && Math.random() < mdt * 0.12) puff(xAt(clam.u) + 4, fy() - 18, 1);
    }

    if (snail.hideT > 0) snail.hideT -= mdt;
    else {
      snail.u += snail.dir * 4 / (b.r - b.l) * mdt;
      if (snail.u > 0.9) snail.dir = -1;
      if (snail.u < 0.08) snail.dir = 1;
    }

    for (const g of grass) g.imp -= g.imp * 2.2 * mdt;

    if (jelly) {
      jelly.ph += mdt;
      jelly.x += jelly.dir * 13 * mdt;
      jelly.vy += (jelly.baseY - jelly.y) * 0.25 * mdt;
      jelly.vy -= jelly.vy * 0.8 * mdt;
      jelly.y += jelly.vy * mdt;
      if (jelly.y < b.t + 30) jelly.y = b.t + 30;
      jelly.squash += (1 - jelly.squash) * Math.min(2.5 * mdt, 1);
      if (jelly.x < b.l - 60 || jelly.x > b.r + 60) {
        jelly = null;
        nextJelly = rand(45, 100);
      }
    } else {
      nextJelly -= mdt;
      if (nextJelly <= 0) spawnJelly();
    }

    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.t += mdt;
      p.ph += mdt * 4;
      p.y -= p.vy * mdt;
      p.x += Math.sin(p.ph) * 4 * mdt;
      if (p.t >= 1.3) puffs.splice(i, 1);
    }
  };

  const hitJelly = (x, y) => jelly && Math.abs(x - jelly.x) < 26 && Math.abs(y - jelly.y) < 28;
  const hitClam = (x, y) => Math.abs(x - xAt(clam.u)) < 28 && Math.abs(y - (fy() - 4)) < 26;
  const hitSnail = (x, y) => Math.abs(x - xAt(snail.u)) < 17 && Math.abs(y - (fy() - 4)) < 16;
  const hitGrass = (x, y) => grass.find(g => Math.abs(x - xAt(g.u)) < 22 && y > fy() - 70 && y < fy() + 12);

  const clickAt = (x, y) => {
    if (!Game.started || !clam) return false;
    if (hitJelly(x, y)) {
      jelly.vy = -85;
      jelly.squash = 0.7;
      puff(jelly.x, jelly.y - 14, 2);
      return true;
    }
    if (hitClam(x, y)) {
      if (clam.pearl) {
        const v = Math.max(1, Math.round(ratePerMin() * 0.2));
        Game.gold += v;
        Stage.spawnPop(xAt(clam.u), fy() - 36, '+' + fmtG(v), true);
        clam.pearl = false;
        nextPearl = rand(60, 100);
      }
      clam.opening = false;
      clam.phase = rand(2.5, 4);
      puff(xAt(clam.u) + 4, fy() - 16, 3);
      return true;
    }
    if (hitSnail(x, y)) {
      snail.hideT = 2.2;
      puff(xAt(snail.u), fy() - 12, 1);
      return true;
    }
    const g = hitGrass(x, y);
    if (g) {
      g.imp = 26;
      puff(xAt(g.u), fy() - 52, 1);
      return true;
    }
    return false;
  };

  const hoverAt = (x, y) => !!(Game.started && clam && (hitJelly(x, y) || hitClam(x, y) || hitSnail(x, y) || hitGrass(x, y)));

  const draw = ctx => {
    if (!Game.started || !clam) return;
    const F = fy();
    ctx.save();
    ctx.lineCap = 'round';

    for (const g of grass) {
      const x = xAt(g.u);
      ctx.strokeStyle = INK(0.12);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x - 26, F + 6);
      ctx.quadraticCurveTo(x, F + 10, x + 26, F + 6);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const bx = x + (i - 1.5) * 9;
        const hgt = 40 + (i % 2) * 16;
        const sway = Math.sin(tNow * 0.7 + g.seed + i * 1.1) * 7 + g.imp * (0.7 + i * 0.15);
        ctx.strokeStyle = INK(0.34 + i * 0.05);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, F + 6);
        ctx.quadraticCurveTo(bx + sway * 0.4, F + 6 - hgt * 0.55, bx + sway, F + 6 - hgt);
        ctx.stroke();
      }
    }

    const cx = xAt(clam.u), cy = F + 2;
    ctx.strokeStyle = INK(0.12);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 5);
    ctx.quadraticCurveTo(cx, cy + 9, cx + 30, cy + 5);
    ctx.stroke();
    if (clam.pearl && clam.open > 0.3) {
      const py = cy - 8 + Math.sin(tNow * 2) * 0.8;
      ctx.fillStyle = 'rgba(255,251,240,0.95)';
      ctx.strokeStyle = INK(0.55);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(cx + 2, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = INK(0.6);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.quadraticCurveTo(cx, cy + 14, cx + 20, cy);
    ctx.quadraticCurveTo(cx + 12, cy - 12, cx - 20, cy);
    ctx.stroke();
    ctx.save();
    ctx.translate(cx - 20, cy);
    ctx.rotate(-clam.open);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(28, -20, 40, 0);
    ctx.stroke();
    ctx.strokeStyle = INK(0.28);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(12, -6);
    ctx.quadraticCurveTo(22, -11, 34, -3);
    ctx.stroke();
    ctx.restore();

    const sx = xAt(snail.u), sy = F + 2, sd = snail.dir, out = snail.hideT <= 0;
    ctx.strokeStyle = INK(0.55);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const q = i / 20, ang = q * Math.PI * 2.3;
      const r = 7.5 * (1 - q * 0.8);
      const px = sx + Math.cos(ang) * r, py = sy - 9 + Math.sin(ang) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (out) {
      const hx = sx + sd * 12;
      ctx.strokeStyle = INK(0.45);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(sx - sd * 8, sy + 1);
      ctx.quadraticCurveTo(sx + sd * 6, sy + 3, hx, sy - 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx, sy - 2);
      ctx.lineTo(hx + sd * 3, sy - 8);
      ctx.moveTo(hx - sd * 2, sy - 2);
      ctx.lineTo(hx, sy - 8);
      ctx.stroke();
    }

    if (jelly) {
      const pulse = 1 + Math.sin(tNow * 1.4) * 0.05;
      const jy = jelly.y + Math.sin(jelly.ph * 0.8) * 6;
      ctx.save();
      ctx.translate(jelly.x, jy);
      ctx.scale(pulse, jelly.squash * (2 - pulse));
      ctx.strokeStyle = INK(0.4);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.quadraticCurveTo(-18, -16, 0, -17);
      ctx.quadraticCurveTo(18, -16, 16, 4);
      ctx.quadraticCurveTo(8, 1, 0, 4);
      ctx.quadraticCurveTo(-8, 1, -16, 4);
      ctx.stroke();
      ctx.strokeStyle = INK(0.26);
      ctx.lineWidth = 1.1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 9, 5);
        ctx.quadraticCurveTo(i * 9 + Math.sin(tNow * 1.6 + i) * 5, 16, i * 9 + Math.sin(tNow * 1.1 + i * 2) * 8, 27);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.lineWidth = 1.1;
    for (const p of puffs) {
      ctx.strokeStyle = `rgba(62,84,110,${p.a * Math.max(1 - p.t / 1.3, 0)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  return { start, update, draw, clickAt, hoverAt };
})();
