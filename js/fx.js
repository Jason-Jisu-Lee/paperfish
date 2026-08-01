const FX = {
  ripples: [],
  snow: [],
  bubbles: [],
  bubbleClock: rnd(0.4, 1),
  bg: [],
  bgClock: rnd(3, 7),
  ripple(x, y, r0, r1, dur, alpha = 0.35) {
    FX.ripples.push({ x, y, r0, r1, dur, a: alpha, t: 0 });
  },
  bubbleBurst(x, y) {
    for (let i = 0; i < 3; i++)
      FX.bubbles.push({ x: x + rnd(-5, 5), y: y + rnd(-4, 4), r: rnd(1, 2.3), v: rnd(30, 55), sway: rnd(0, TAU), swaySp: rnd(2, 4), a: rnd(0.15, 0.3), life: rnd(1, 1.7), age: 0 });
  },
  initSnow(density) {
    FX.snow = [];
    const n = Math.round(46 * density);
    for (let i = 0; i < n; i++)
      FX.snow.push({ x: rnd(0, innerWidth), y: rnd(0, innerHeight), v: rnd(5, 14), sway: rnd(0, TAU), r: rnd(0.6, 1.6), a: rnd(0.05, 0.16) });
  },
  update(dt, t) {
    for (const r of FX.ripples) r.t += dt;
    FX.ripples = FX.ripples.filter(r => r.t < r.dur);
    for (const s of FX.snow) {
      s.y += s.v * dt;
      s.x += Math.sin(t * 0.4 + s.sway) * 3 * dt;
      if (s.y > innerHeight + 4) { s.y = -4; s.x = rnd(0, innerWidth); }
    }
    FX.bubbleClock -= dt;
    if (FX.bubbleClock <= 0) {
      FX.bubbleClock = rnd(0.5, 1.2);
      FX.bubbles.push({ x: rnd(0, innerWidth), y: innerHeight + rnd(0, 40), r: rnd(1.2, 3.2), v: rnd(18, 38), sway: rnd(0, TAU), swaySp: rnd(1.2, 2.6), a: rnd(0.08, 0.2), life: rnd(3.5, 7), age: 0 });
    }
    for (const b of FX.bubbles) {
      b.age += dt;
      b.y -= b.v * dt;
      b.x += Math.sin(t * b.swaySp + b.sway) * 8 * dt;
    }
    FX.bubbles = FX.bubbles.filter(b => b.age < b.life && b.y > -20);
    FX.bgClock -= dt;
    if (FX.bgClock <= 0 && FX.bg.length < 4) {
      FX.bgClock = rnd(8, 16);
      const sp = pick(SPECIES).id;
      const toRight = Math.random() < 0.5;
      FX.bg.push({
        sp, x: toRight ? -70 : innerWidth + 70, y: rnd(innerHeight * 0.12, innerHeight * 0.82),
        dir: toRight ? 1 : -1, speed: rnd(6, 12), scale: rnd(0.26, 0.4), a: rnd(0.045, 0.09), phase: rnd(0, TAU)
      });
    }
    for (const f of FX.bg) { f.x += f.dir * f.speed * dt; f.y += Math.sin(t * 0.3 + f.phase) * 2 * dt; }
    FX.bg = FX.bg.filter(f => f.x > -110 && f.x < innerWidth + 110);
  },
  drawSnow(ctx) {
    for (const s of FX.snow) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  drawBubbles(ctx) {
    for (const b of FX.bubbles) {
      const k = b.age < 0.3 ? b.age / 0.3 : (b.life - b.age < 0.6 ? (b.life - b.age) / 0.6 : 1);
      ctx.globalAlpha = b.a * Math.max(0, k);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
  drawBg(ctx) {
    for (const f of FX.bg) {
      const s = SP[f.sp];
      const img = ASSETS.ras[f.sp];
      if (!img) continue;
      const w = s.size * f.scale, h = w * s.asp;
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.dir < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = f.a;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },
  drawRipples(ctx) {
    for (const r of FX.ripples) {
      const k = r.t / r.dur;
      ctx.globalAlpha = r.a * (1 - k);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(r.x, r.y, lerp(r.r0, r.r1, eo(k)), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};
