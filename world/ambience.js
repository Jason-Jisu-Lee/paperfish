const Ambience = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const bubbles = [];
  const motes = [];
  const vents = [];
  let nextVent = rand(7, 17);
  let nextSil = rand(35, 80);
  let sil = null;
  let school = null;
  let nextSchool = rand(20, 50);
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

  const spawnSchool = () => {
    const { W, H } = Stage.size;
    const ltr = Math.random() < 0.5;
    const giant = Math.random() < 0.1;
    const m = giant
      ? { s: 3.6, a: 0.34, v: 0.38, sp: 3.2, fade: 620 }
      : { s: 1, a: 1, v: 1, sp: 1, fade: 240 };
    school = {
      giant, am: m.a, fadeW: m.fade,
      ang: ltr ? 0 : Math.PI, dx: ltr ? 1 : -1, dy: 0,
      x: ltr ? -180 * m.sp : W + 180 * m.sp,
      y: H * (giant ? rand(0.3, 0.7) : rand(0.12, 0.88)),
      prog: 0,
      total: W + 360 * m.sp,
      v: rand(240, 327) * m.v,
      t: 0,
      fish: Array.from({ length: 26 + Math.floor(Math.random() * 10) }, () => {
        const far = !giant && Math.random() < 0.42;
        return {
          ox: rand(-105, 18) * m.sp,
          oy: (rand(-32, 32) + (far ? -8 : 5)) * m.sp,
          ph: rand(0, 7), wf: rand(5, 9),
          s: rand(0.89, 1.58) * m.s * (far ? 0.62 : 1),
          lag: rand(0.85, 1.15),
          far, drift: far ? rand(-24, -11) : 0
        };
      })
    };
  };

  const tinyFish = (ctx, x, y, s, dir) => {
    ctx.beginPath();
    ctx.moveTo(x + 5.5 * s * dir, y);
    ctx.quadraticCurveTo(x, y - 1.7 * s, x - 6.2 * s * dir, y - 0.3 * s);
    ctx.quadraticCurveTo(x - 3.8 * s * dir, y + 0.6 * s, x + 0.4 * s * dir, y + 1.4 * s);
    ctx.quadraticCurveTo(x + 3.2 * s * dir, y + 1.2 * s, x + 5.5 * s * dir, y);
    ctx.fill();
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
      if (!vents.length) nextVent = rand(14, 30);
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

    if (school) {
      school.t += mdt;
      const step = school.v * (1 + school.t * (school.giant ? 0.06 : 0.25)) * mdt;
      const drift = Math.sin(school.t * 1.7) * 14 * mdt;
      school.prog += step;
      school.x += school.dx * step - school.dy * drift;
      school.y += school.dy * step + school.dx * drift;
      for (const f of school.fish) if (f.drift) f.ox += f.drift * mdt;
      if (school.prog > school.total) {
        school = null;
        nextSchool = rand(20, 50);
      }
    } else {
      nextSchool -= mdt;
      if (nextSchool <= 0) spawnSchool();
    }
  };

  const paintSchool = ctx => {
    const edge = Math.min(school.prog, school.total - school.prog) / school.fadeW;
    if (edge <= 0) return;
    const base = 0.14 * school.am * Math.min(edge, 1);
    ctx.fillStyle = 'rgba(28,27,24,1)';
    ctx.save();
    ctx.translate(school.x, school.y);
    ctx.rotate(school.ang);
    for (const f of school.fish) {
      ctx.globalAlpha = base * (f.far ? 0.52 : 1);
      tinyFish(ctx, f.ox * f.lag, f.oy + Math.sin(school.t * f.wf + f.ph) * 3.2, f.s, 1);
    }
    ctx.restore();
  };

  const drawBack = ctx => {
    if (school && school.giant) paintSchool(ctx);
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
    if (school && !school.giant) paintSchool(ctx);
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
