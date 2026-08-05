const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const fmt = n => {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const units = ['k', 'm', 'b', 't', 'q'];
  let u = -1;
  while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
  if (n >= 999.5 && u < units.length - 1) { n /= 1000; u++; }
  const s = n >= 100 ? String(Math.round(n)) : n.toFixed(n >= 10 ? 1 : 2).replace(/\.?0+$/, '');
  return s + units[u];
};
