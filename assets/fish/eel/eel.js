(() => {
  const sp = SPECIES.find(s => s.file === 'eel');
  const N = 15, P = 40;
  const rise = u => Math.sin(Math.min(u / 0.12, 1) * Math.PI / 2);
  const taper = u => u < 0.55 ? 1 : Math.pow(1 - (u - 0.55) / 0.45, 0.9);
  const path = pts => {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++)
      d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${((pts[i][0] + pts[i + 1][0]) / 2).toFixed(1)} ${((pts[i][1] + pts[i + 1][1]) / 2).toFixed(1)}`;
    const l = pts[pts.length - 1];
    return d + ` L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
  };
  sp.banks = [1, 0.68, 0.42].map(scale => {
    const bank = [];
    for (let f = 0; f < N; f++) {
      const ph = 2 * Math.PI * f / N, spn = [], top = [], bot = [];
      let e;
      for (let i = 0; i <= P; i++) {
        const u = i / P;
        const A = 15 * scale * (0.10 + 0.90 * Math.pow(u, 1.5));
        spn.push([200 - 190 * u, 35 + A * Math.sin(2 * Math.PI * 1.35 * u - ph), u]);
      }
      for (let i = 0; i <= P; i++) {
        const p = spn[i], a = spn[Math.max(i - 1, 0)], b = spn[Math.min(i + 1, P)];
        const m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = -(b[1] - a[1]) / m, ny = (b[0] - a[0]) / m;
        const r = 4.8 * rise(p[2]) * taper(p[2]);
        top.push([p[0] + nx * r, p[1] + ny * r]);
        bot.push([p[0] - nx * r, p[1] - ny * r]);
        if (i === 3) e = [p[0] + nx * 1.1, p[1] + ny * 1.1];
      }
      bank.push({ p: [path(top), path(bot)], e });
    }
    return bank;
  });
  sp.paths = sp.banks[0][0].p;
  sp.dots = [{ cx: sp.banks[0][0].e[0], cy: sp.banks[0][0].e[1], r: 1.5 }];
})();
