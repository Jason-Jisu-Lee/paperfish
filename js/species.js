const SPECIES = [
  { id: 'minnow', name: 'minnow', size: 34, asp: 0.294, pay: 1, cost: 3 },
  { id: 'bass', name: 'bass', size: 52, asp: 0.325, pay: 3, cost: 40 },
  { id: 'perch', name: 'perch', size: 58, asp: 0.376, pay: 7, cost: 200 },
  { id: 'cod', name: 'cod', size: 55, asp: 0.547, pay: 16, cost: 1000 },
  { id: 'flounder', name: 'flounder', size: 66, asp: 0.667, pay: 38, cost: 5200 },
  { id: 'trout', name: 'trout', size: 60, asp: 0.365, pay: 90, cost: 26000 },
  { id: 'mackerel', name: 'mackerel', size: 62, asp: 0.339, pay: 210, cost: 120000 },
  { id: 'pike', name: 'pike', size: 78, asp: 0.274, pay: 500, cost: 550000 },
  { id: 'ray', name: 'ray', size: 92, asp: 0.7, pay: 1200, cost: 2400000 },
  { id: 'shark', name: 'shark', size: 110, asp: 0.424, pay: 2800, cost: 10000000 },
  { id: 'jelly', name: 'jellyfish', size: 48, asp: 1.098, pay: 6500, cost: 42000000 },
  { id: 'seahorse', name: 'seahorse', size: 36, asp: 1.643, pay: 15000, cost: 170000000 },
  { id: 'angler', name: 'anglerfish', size: 64, asp: 0.625, pay: 40000, cost: 700000000, lamp: { x: 0.884, y: 0.129 } }
];
const SP = {};
SPECIES.forEach((s, i) => { SP[s.id] = s; s.tier = i; s.spd = clamp(64 - s.size * 0.12, 34, 70); });

const ECON = { interval: 10, minInterval: 5, costGrowth: 1.35, cap: 12 };

const UPGRADES = [
  { id: 'glow', name: 'glow', sub: 'each payout gives 1 more gold', base: 30, growth: 8, max: 5 },
  { id: 'current', name: 'current', sub: 'payouts come 1s sooner', base: 150, growth: 10, max: 5 },
  { id: 'rich', name: 'rich water', sub: 'payouts double', base: 400, growth: 12, max: 8 }
];

const tickInterval = up => Math.max(ECON.minInterval, ECON.interval - up.current);
const payoutOf = (s, up) => s.pay * Math.pow(2, up.rich) + up.glow;
const fishCost = (s, owned) => Math.round(s.cost * Math.pow(ECON.costGrowth, Math.max(0, owned - (s.id === 'minnow' ? 1 : 0))));
const upCost = (u, lvl) => Math.round(u.base * Math.pow(u.growth, lvl));
