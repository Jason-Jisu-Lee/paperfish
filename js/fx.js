const FX = {
  ripples: [],
  snow: [],
  bubbles: [],
  bubbleClock: rnd(8, 16),
  giant: null,
  giantClock: rnd(45, 90),
  ripple(x, y, r0, r1, dur, alpha = 0.35) {
    FX.ripples.push({ x, y, r0, r1, dur, a: alpha, t: 0 });
  },
  bubbleBurst(x, y) {
    for (let i = 0; i < 3; i++)
      FX.bubbles.push({ x: x + rnd(-5, 5), y: y + rnd(-4, 4), r: rnd(1, 2.3), v: rnd(30, 55), sway: rnd(0, TAU), swaySp: rnd(2, 4), a: rnd(0.15, 0.3), life: rnd(1, 1.7), age: 0 });
  },
  bubbleStream() {
    const x = rnd(innerWidth * 0.15, innerWidth * 0.85);
    const n = Math.round(rnd(4, 9));
    for (let i = 0; i < n; i++)
      FX.bubbles.push({ x: x + rnd(-10, 10), y: innerHeight + rnd(0, 20), r: rnd(1.6, 3.6), v: rnd(48, 78), sway: rnd(0, TAU), swaySp: rnd(1, 2.2), a: rnd(0.12, 0.24), life: rnd(9, 15), age: -i * rnd(0.08, 0.16) });
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
      FX.bubbleClock = rnd(12, 24);
      FX.bubbleStream();
    }
    for (const b of FX.bubbles) {
      b.age += dt;
      if (b.age < 0) continue;
      b.y -= b.v * dt;
      b.x += Math.sin(t * b.swaySp + b.sway) * 8 * dt;
    }
    FX.bubbles = FX.bubbles.filter(b => b.age < b.life && b.y > -20);
    FX.giantClock -= dt;
    if (!FX.giant && FX.giantClock <= 0) {
      FX.giantClock = rnd(75, 150);
      const sp = pick(['shark', 'ray', 'oarfish', 'gulper']);
      const toRight = Math.random() < 0.5;
      FX.giant = {
        sp, x: toRight ? -220 : innerWidth + 220, y: rnd(innerHeight * 0.16, innerHeight * 0.58),
        dir: toRight ? 1 : -1, speed: rnd(9, 15), scale: rnd(2.6, 3.6), a: rnd(0.16, 0.24), phase: rnd(0, TAU)
      };
    }
    if (FX.giant) {
      FX.giant.x += FX.giant.dir * FX.giant.speed * dt;
      FX.giant.y += Math.sin(t * 0.15 + FX.giant.phase) * 3 * dt;
      if (FX.giant.x < -260 || FX.giant.x > innerWidth + 260) FX.giant = null;
    }
  },
  drawGiant(ctx) {
    const g = FX.giant;
    if (!g) return;
    const s = SP[g.sp];
    const img = ASSETS.ras[g.sp];
    if (!img) return;
    const w = s.size * g.scale, h = w * s.asp;
    ctx.save();
    ctx.translate(g.x, g.y);
    if (g.dir < 0) ctx.scale(-1, 1);
    ctx.globalAlpha = g.a;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
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
      if (b.age < 0) continue;
      const k = b.age < 0.3 ? b.age / 0.3 : (b.life - b.age < 0.8 ? (b.life - b.age) / 0.8 : 1);
      ctx.globalAlpha = b.a * Math.max(0, k);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke();
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
