const Ambience = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const bubbles = [];
  const motes = [];
  const vents = [];
  let nextVent = rand(10, 24);
  let nextSil = rand(35, 80);
  let sil = null;
  let seeded = false;

  const seedMotes = () => {
    const { W, H } = Stage.size;
    for (let i = 0; i < 16; i++) {
      motes.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-2.5, 2.5), vy: rand(-1.2, 1.2),
        r: rand(0.8, 1.7), a: rand(0.04, 0.085)
      });
    }
    seeded = true;
  };

  const startVent = () => {
    const b = Stage.bounds;
    const n = Math.random() < 0.25 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      vents.push({
        x: rand(b.l + 40, b.r - 40),
        t: 0,
        dur: rand(1.1, 2),
        rate: rand(2.2, 3.6),
        acc: 0.8
      });
    }
  };

  const spawnSil = () => {
    const { W, H } = Stage.size;
    const sp = SPECIES.find(s => s.file === 'ray');
    const ltr = Math.random() < 0.5;
    const sc = (sp.len / sp.vb[0]) * rand(3.2, 4.6);
    sil = {
      sp, sc,
      dir: ltr ? 1 : -1,
      x: ltr ? -sp.vb[0] * sc : W + sp.vb[0] * sc,
      y: rand(H * 0.18, H * 0.6),
      v: rand(11, 19)
    };
  };

  const update = mdt => {
    if (!seeded) seedMotes();
    if (!mdt) return;
    const { W, H } = Stage.size;

    if (vents.length) {
      for (let i = vents.length - 1; i >= 0; i--) {
        const v = vents[i];
        v.t += mdt;
        v.acc += v.rate * mdt;
        while (v.acc >= 1) {
          v.acc -= 1;
          bubbles.push({
            x: v.x + rand(-12, 12),
            y: H + rand(6, 26),
            r: rand(1.6, 4.2),
            vy: rand(150, 230),
            wamp: rand(3, 7),
            wf: rand(0.5, 1),
            ph: rand(0, Math.PI * 2),
            a: rand(0.2, 0.32),
            fade: 1
          });
        }
        if (v.t >= v.dur) vents.splice(i, 1);
      }
      if (!vents.length) nextVent = rand(19, 42);
    } else {
      nextVent -= mdt;
      if (nextVent <= 0) startVent();
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.ph += mdt * b.wf * Math.PI * 2;
      b.y -= b.vy * (1 + (1 - b.y / H) * 0.35) * mdt;
      b.x += Math.sin(b.ph) * b.wamp * mdt;
      if (b.y < H * 0.07) b.fade -= mdt / 0.45;
      if (b.fade <= 0) bubbles.splice(i, 1);
    }

    for (const m of motes) {
      m.x += m.vx * mdt;
      m.y += m.vy * mdt;
      if (m.x < -4) m.x = W + 4;
      if (m.x > W + 4) m.x = -4;
      if (m.y < -4) m.y = H + 4;
      if (m.y > H + 4) m.y = -4;
    }

    if (sil) {
      sil.x += sil.dir * sil.v * mdt;
      const off = sil.sp.vb[0] * sil.sc + 60;
      if ((sil.dir > 0 && sil.x > W + off) || (sil.dir < 0 && sil.x < -off)) {
        sil = null;
        nextSil = rand(70, 170);
      }
    } else {
      nextSil -= mdt;
      if (nextSil <= 0) spawnSil();
    }
  };

  const drawBack = ctx => {
    if (sil) {
      const sp = sil.sp;
      ctx.save();
      ctx.translate(sil.x, sil.y);
      ctx.scale(sil.dir * sil.sc, sil.sc);
      ctx.translate(-sp.vb[0] / 2, -sp.vb[1] / 2);
      if (sp.mirror) {
        ctx.translate(sp.vb[0], 0);
        ctx.scale(-1, 1);
      }
      ctx.fillStyle = 'rgba(90,86,74,0.06)';
      for (const p of sp.p2d) ctx.fill(p);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(28,27,24,1)';
    for (const m of motes) {
      ctx.globalAlpha = m.a;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawFront = ctx => {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(62,84,110,1)';
    for (const b of bubbles) {
      const grow = 1 + (1 - b.y / Stage.size.H) * 0.3;
      ctx.globalAlpha = b.a * Math.max(b.fade, 0);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * grow, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  return { update, drawBack, drawFront };
})();
