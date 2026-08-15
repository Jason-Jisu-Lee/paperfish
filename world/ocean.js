const Ocean = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const INK = a => `rgba(28,27,24,${a})`;
  const CLAM = a => `rgba(96,50,42,${a})`;
  const puffs = [];
  let clam = null, snail = null;
  let nextPearl = 0, tNow = 0;

  const fy = () => Stage.size.H * 0.93;
  const xAt = u => { const b = Stage.bounds; return b.l + u * (b.r - b.l); };

  const puff = (x, y, n) => {
    for (let i = 0; i < n; i++) puffs.push({
      x: x + rand(-4, 4), y, r: rand(1.2, 2.6),
      vy: rand(45, 75), ph: rand(0, 7), a: rand(0.18, 0.3), t: 0
    });
  };

  const start = () => {
    clam = { u: rand(0.38, 0.52), open: 0, opening: true, phase: rand(2, 5), pearl: false };
    snail = { u: rand(0.78, 0.88), dir: -1, hideT: 0 };
    nextPearl = 180;
    puffs.length = 0;
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

    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.t += mdt;
      p.ph += mdt * 4;
      p.y -= p.vy * mdt;
      p.x += Math.sin(p.ph) * 4 * mdt;
      if (p.t >= 1.3) puffs.splice(i, 1);
    }
  };

  const hitClam = (x, y) => Math.abs(x - xAt(clam.u)) < 28 && Math.abs(y - (fy() - 4)) < 26;
  const hitSnail = (x, y) => Math.abs(x - xAt(snail.u)) < 17 && Math.abs(y - (fy() - 4)) < 16;

  const clickAt = (x, y) => {
    if (!Game.started || !clam) return false;
    if (hitClam(x, y)) {
      if (clam.pearl) {
        const v = Math.max(1, Math.round(ratePerMin() * 0.2));
        Game.gold += v;
        Stage.spawnPop(xAt(clam.u), fy() - 36, '+' + fmtG(v), true);
        clam.pearl = false;
        nextPearl = rand(60, 80);
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
    return false;
  };

  const hoverAt = (x, y) => !!(Game.started && clam && (hitClam(x, y) || hitSnail(x, y)));

  const draw = ctx => {
    if (!Game.started || !clam) return;
    const F = fy();
    ctx.save();
    ctx.lineCap = 'round';

    const cx = xAt(clam.u), cy = F + 2;
    ctx.strokeStyle = INK(0.12);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 5);
    ctx.quadraticCurveTo(cx, cy + 9, cx + 30, cy + 5);
    ctx.stroke();
    if (clam.pearl && clam.open > 0.3) {
      const py = cy - 8 + Math.sin(tNow * 2) * 0.8;
      const g = ctx.createRadialGradient(cx + 2, py, 1, cx + 2, py, 15);
      g.addColorStop(0, 'rgba(180,58,43,0.16)');
      g.addColorStop(1, 'rgba(180,58,43,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx + 2, py, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(233,182,166,0.95)';
      ctx.strokeStyle = 'rgba(180,58,43,0.75)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(cx + 2, py, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,251,240,0.9)';
      ctx.beginPath();
      ctx.arc(cx + 1, py - 1.2, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(180,58,43,0.05)';
    ctx.strokeStyle = CLAM(0.6);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.quadraticCurveTo(cx, cy + 14, cx + 20, cy);
    ctx.quadraticCurveTo(cx + 12, cy - 12, cx - 20, cy);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(cx - 20, cy);
    ctx.rotate(-clam.open);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(28, -20, 40, 0);
    ctx.stroke();
    ctx.strokeStyle = CLAM(0.28);
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
