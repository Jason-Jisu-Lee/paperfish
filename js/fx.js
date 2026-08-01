const FX = {
  ripples: [],
  snow: [],
  ripple(x, y, r0, r1, dur, alpha = 0.35) {
    FX.ripples.push({ x, y, r0, r1, dur, a: alpha, t: 0 });
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
  },
  drawSnow(ctx) {
    for (const s of FX.snow) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
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
