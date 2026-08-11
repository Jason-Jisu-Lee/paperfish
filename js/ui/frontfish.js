(() => {
  const front = document.getElementById('front');
  const canvas = document.getElementById('frontsea');
  const ctx = canvas.getContext('2d');
  const fishes = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  let dpr = 1, w = 0, h = 0, spawnT = 0, last = 0;

  const paths = SPECIES.map(sp => sp.paths.map(d => new Path2D(d)));

  const resize = () => {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  };

  const spawn = () => {
    const s = Math.floor(Math.random() * SPECIES.length);
    const width = rand(64, 118);
    const dir = Math.random() < 0.5 ? 1 : -1;
    fishes.push({
      s, dir,
      x: dir > 0 ? -width : w + width,
      y: rand(h * 0.1, h * 0.9),
      v: rand(16, 40),
      scale: width / SPECIES[s].vb[0],
      ph: rand(0, Math.PI * 2),
      alpha: rand(0.32, 0.55)
    });
  };

  const step = dt => {
    spawnT -= dt;
    if (spawnT <= 0 && fishes.length < 6) {
      spawn();
      spawnT = rand(2.2, 5.5);
    }
    for (let i = fishes.length - 1; i >= 0; i--) {
      const f = fishes[i];
      f.x += f.dir * f.v * dt;
      f.ph += dt * 0.9;
      if ((f.dir > 0 && f.x > w + 160) || (f.dir < 0 && f.x < -160)) fishes.splice(i, 1);
    }
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(28,27,24,0.8)';
    ctx.fillStyle = 'rgba(28,27,24,0.8)';
    for (const f of fishes) {
      const sp = SPECIES[f.s];
      const edge = Math.min((f.x + 150) / 150, (w + 150 - f.x) / 150, 1);
      ctx.save();
      ctx.globalAlpha = f.alpha * Math.max(edge, 0);
      ctx.translate(f.x, f.y + Math.sin(f.ph) * 7);
      ctx.scale((sp.mirror ? -1 : 1) * f.dir * f.scale, f.scale);
      ctx.translate(-sp.vb[0] / 2, -sp.vb[1] / 2);
      ctx.lineWidth = 1.6 / f.scale;
      for (const p of paths[f.s]) ctx.stroke(p);
      if (sp.dots) {
        for (const d of sp.dots) {
          ctx.beginPath();
          ctx.arc(d.cx, d.cy, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  };

  const loop = ts => {
    requestAnimationFrame(loop);
    const dt = Math.min((ts - last) / 1000 || 0, 0.05);
    last = ts;
    if (front.hasAttribute('hidden')) return;
    if (canvas.clientWidth !== w || canvas.clientHeight !== h) resize();
    step(dt);
    draw();
  };

  resize();
  for (let i = 0; i < 3; i++) {
    spawn();
    fishes[i].x = rand(w * 0.12, w * 0.88);
  }
  requestAnimationFrame(ts => {
    last = ts;
    requestAnimationFrame(loop);
  });
})();
