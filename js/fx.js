const FX = {
  ripples: [],
  bubbles: [],
  kelp: [],
  bubbleClock: rnd(8, 16),
  giant: null,
  giantClock: rnd(45, 90),
  floats: [],
  ripple(x, y, r0, r1, dur, alpha = 0.35) {
    FX.ripples.push({ x, y, r0, r1, dur, a: alpha, t: 0 });
  },
  bubbleBurst(x, y) {
    for (let i = 0; i < 3; i++)
      FX.bubbles.push({ x: x + rnd(-5, 5), y: y + rnd(-4, 4), r: rnd(1, 2.3), v: rnd(30, 55), sway: rnd(0, TAU), swaySp: rnd(2, 4), a: rnd(0.15, 0.3), life: rnd(1, 1.7), age: 0 });
  },
  bubbleStream() {
    const x = rnd(MAIN.W * 0.15, MAIN.W * 0.85);
    const n = Math.round(rnd(4, 9));
    for (let i = 0; i < n; i++)
      FX.bubbles.push({ x: x + rnd(-10, 10), y: MAIN.H + rnd(0, 20), r: rnd(1.6, 3.6), v: rnd(48, 78), sway: rnd(0, TAU), swaySp: rnd(1, 2.2), a: rnd(0.12, 0.24), life: rnd(9, 15), age: -i * rnd(0.08, 0.16) });
  },
  addFloat(x, y, txt) {
    FX.floats.push({ x, y, txt, age: 0 });
  },
  initKelp(W, H) {
    FX.kelp = [];
    const nClusters = 3;
    for (let c = 0; c < nClusters; c++) {
      let bx = rnd(60, W - 60);
      if (Math.abs(bx - W / 2) < 140) bx += bx < W / 2 ? -160 : 160;
      const blades = Math.round(rnd(2, 3));
      for (let b = 0; b < blades; b++)
        FX.kelp.push({ x: clamp(bx + rnd(-18, 18), 30, W - 30), len: rnd(55, 115), phase: rnd(0, TAU), sp: rnd(0.35, 0.6), amp: rnd(0.08, 0.14), a: rnd(0.14, 0.22) });
    }
  },
  drawKelp(ctx, t, H) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const k of FX.kelp) {
      const sway = Math.sin(t * k.sp + k.phase) * k.len * k.amp;
      ctx.globalAlpha = k.a;
      ctx.beginPath();
      ctx.moveTo(k.x, H + 2);
      ctx.quadraticCurveTo(k.x + sway * 0.35, H - k.len * 0.55, k.x + sway, H - k.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
  update(dt, t) {
    for (const r of FX.ripples) r.t += dt;
    FX.ripples = FX.ripples.filter(r => r.t < r.dur);
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
    if (FX.giant) {
      FX.giant.x += FX.giant.dir * FX.giant.speed * dt;
      FX.giant.y += Math.sin(t * 0.15 + FX.giant.phase) * 3 * dt;
      if (FX.giant.x < -260 || FX.giant.x > MAIN.W + 260) FX.giant = null;
    } else {
      FX.giantClock -= dt;
      if (FX.giantClock <= 0) {
        FX.giantClock = rnd(75, 150);
        const sp = pick(['shark', 'ray']);
        const toRight = Math.random() < 0.5;
        FX.giant = {
          sp, x: toRight ? -220 : MAIN.W + 220, y: rnd(MAIN.H * 0.16, MAIN.H * 0.58),
          dir: toRight ? 1 : -1, speed: rnd(9, 15), scale: rnd(2.6, 3.6), a: rnd(0.16, 0.24), phase: rnd(0, TAU)
        };
      }
    }
    for (const f of FX.floats) f.age += dt;
    FX.floats = FX.floats.filter(f => f.age < 1);
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
  drawFloats(ctx) {
    ctx.textAlign = 'center';
    ctx.font = '500 11px system-ui, sans-serif';
    for (const f of FX.floats) {
      ctx.globalAlpha = 0.55 * (1 - f.age);
      ctx.fillStyle = '#ffd75e';
      ctx.fillText(f.txt, f.x, f.y - f.age * 22);
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
