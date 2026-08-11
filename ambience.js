const Ambience = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const bubbles = [];
  const motes = [];
  const rings = [];
  let vent = null;
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
    vent = {
      x: rand(b.l + 40, b.r - 40),
      t: 0,
      dur: rand(2, 4.2),
      rate: rand(2.8, 5.5),
      acc: 0.8
    };
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

  const popAt = (x, y) => {
    const { H } = Stage.size;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      const r = Math.max(b.r * (1 + (1 - b.y / H) * 0.3), 8) + 7;
      const dx = b.x - x, dy = b.y - y;
      if (dx * dx + dy * dy <= r * r) {
        rings.push({ x: b.x, y: b.y, t: 0 });
        bubbles.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  const update = mdt => {
    if (!seeded) seedMotes();
    if (!mdt) return;
    const { W, H } = Stage.size;

    for (let i = rings.length - 1; i >= 0; i--) {
      rings[i].t += mdt;
      if (rings[i].t >= 0.5) rings.splice(i, 1);
    }

    if (vent) {
      vent.t += mdt;
      vent.acc += vent.rate * mdt;
      while (vent.acc >= 1) {
        vent.acc -= 1;
        bubbles.push({
          x: vent.x + rand(-14, 14),
          y: H + rand(6, 30),
          r: rand(1.6, 4.4),
          vy: rand(26, 46),
          wamp: rand(2, 6),
          wf: rand(0.35, 0.8),
          ph: rand(0, Math.PI * 2),
          a: rand(0.12, 0.2),
          fade: 1
        });
      }
      if (vent.t >= vent.dur) {
        vent = null;
        nextVent = rand(22, 55);
      }
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
      ctx.fillStyle = 'rgba(90,86,74,0.055)';
      ctx.strokeStyle = 'rgba(90,86,74,0.05)';
      ctx.lineWidth = sp.sw * 2;
      for (const p of sp.p2d) {
        ctx.fill(p);
        ctx.stroke(p);
      }
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
    ctx.strokeStyle = 'rgba(28,27,24,1)';
    for (const b of bubbles) {
      const grow = 1 + (1 - b.y / Stage.size.H) * 0.3;
      ctx.globalAlpha = b.a * Math.max(b.fade, 0);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * grow, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const r of rings) {
      const u = r.t / 0.5;
      ctx.globalAlpha = 0.4 * (1 - u);
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4 + u * 15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  return { update, drawBack, drawFront, popAt };
})();
