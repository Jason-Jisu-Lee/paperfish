const Game = {
  gold: 0,
  stream: 0,
  mating: 0,
  maturity: 0,
  longevity: 0,
  plants: 0,
  unlocked: 1,
  tuts: {},
  fish: [],
  speed: 1,
  started: false
};

const SAVE_KEY = 'paperfish.save';
let skipSave = false;

const streamCost = () => 100 * 2 ** Game.stream;
const matingCost = () => 1500 * 2 ** Game.mating;
const maturityCost = () => 3000 * 2 ** Game.maturity;
const longevityCost = () => 5000 * 2 ** Game.longevity;
const KELP_COST = 20;
const START_GOLD = 70;
const MAX_AGE = 10;
const FIRSTF_CAP = 20;
const streamFor = s => s === 0 ? Game.stream : 0;
const adultAtOf = s => {
  const a = SPECIES[s].adultAt;
  return a === undefined ? undefined : Math.max(a - Game.maturity * 5 / 60, a * 0.2);
};

const fmtG = n => {
  n = Math.floor(n);
  const one = v => {
    const r = Math.floor(v * 10) / 10;
    return Number.isInteger(r) ? String(r) : r.toFixed(1);
  };
  if (n >= 1e9) return one(n / 1e9) + 'b';
  if (n >= 1e6) return one(n / 1e6) + 'm';
  if (n >= 1e5) return one(n / 1e3) + 'k';
  return n.toLocaleString('en-US');
};
const hatchTime = s => SPECIES[s].hatch ?? 60;

const lifeOf = s => (SPECIES[s].life || SPECIES[s].maxAge || MAX_AGE) + (s === 0 ? Game.longevity * 0.5 : 0);

const speciesPhases = s => {
  const sp = SPECIES[s];
  if (sp._ph) return sp._ph;
  if (sp.phases) {
    const dur = sp.life / sp.phases.length;
    const tick = sp.tick || 5;
    sp._ph = sp.phases.map(a => ({ dur, amt: a, tick, gpm: a * 60 / tick }));
  } else {
    const cap = sp.maxAge || MAX_AGE;
    sp._ph = [];
    for (let m = 0; m < cap; m++) sp._ph.push({ dur: 1, amt: sp.gpm * (12 + m), tick: 60, gpm: sp.gpm * (12 + m) });
  }
  return sp._ph;
};

const phaseAt = (s, age) => {
  const ph = speciesPhases(s);
  let t = age || 0;
  for (const p of ph) {
    if (t < p.dur) return p;
    t -= p.dur;
  }
  return ph[ph.length - 1];
};

const phaseVal = (s, p) => (p.amt + streamFor(s)) * 60 / p.tick;

const speciesGpm = (s, age) => phaseVal(s, phaseAt(s, age));

const ltvOf = s => {
  const ph = speciesPhases(s);
  let sum = 0, dur = 0;
  for (const p of ph) {
    sum += phaseVal(s, p) * p.dur;
    dur += p.dur;
  }
  return sum + Math.max(lifeOf(s) - dur, 0) * phaseVal(s, ph[ph.length - 1]);
};

const ratePerMin = () => {
  let r = 0;
  for (const f of Game.fish) if (!f.egg && f.dying === undefined) r += speciesGpm(f.s, f.age) + streamFor(f.s);
  return r;
};

const saveGame = () => {
  if (skipSave || !Game.started) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1,
      gold: Game.gold,
      stream: Game.stream,
      mating: Game.mating,
      maturity: Game.maturity,
      lng: Game.longevity,
      plants: Game.plants,
      kb: Game.kelpBought || 0,
      tuts: Game.tuts || {},
      unlocked: Game.unlocked,
      fish: Game.fish.map(f => ({
        s: f.s, egg: f.egg ? 1 : 0, t: Math.round(f.t || 0),
        a: Math.round((f.age || 0) * 100) / 100,
        sp: f.spawned || 0,
        h: f.hstate || 0, ha: Math.round((f.hungerAt || 0) * 100) / 100
      }))
    }));
  } catch (e) {}
};

const loadGame = () => {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d || d.v !== 1) return false;
    Game.gold = d.gold || 0;
    Game.stream = d.stream || 0;
    Game.plants = d.plants || 0;
    Game.unlocked = Math.min(Math.max(d.unlocked || 1, 1), SPECIES.length);
    Game.mating = d.mating || 0;
    Game.maturity = d.maturity || 0;
    Game.longevity = d.lng || 0;
    Game.kelpBought = d.kb || 0;
    Game.tuts = typeof d.tut === 'number' ? (d.tut >= 1 ? { start: 1 } : {}) : d.tuts || {};
    Game.fish = (d.fish || [])
      .filter(f => f && f.s >= 0 && f.s < SPECIES.length)
      .map(f => ({ s: f.s, egg: !!f.egg, t: f.t || 0, age: f.a || 0, spawned: f.sp || 0, hstate: f.h || 0, hT: 0, hungerAt: f.ha || 0 }));
    return true;
  } catch (e) { return false; }
};

const resetGame = () => {
  skipSave = true;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
};

const buyFish = s => {
  if (s >= Game.unlocked || Game.gold < SPECIES[s].cost) return false;
  if (s === 0 && Game.fish.filter(f => f.s === 0 && f.dying === undefined).length >= FIRSTF_CAP) return false;
  Game.gold -= SPECIES[s].cost;
  const f = { s, egg: true, t: 0 };
  Game.fish.push(f);
  Stage.materialize(f);
  Obj.event('buyfish');
  if (!Game.tuts.sayegg) {
    Game.tuts.sayegg = 1;
    Say.say(WHISPER.egg);
  }
  saveGame();
  return true;
};

const buyStream = () => {
  const c = streamCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.stream += 1;
  Obj.event('income');
  saveGame();
  return true;
};

const buyKelp = () => {
  if (Game.gold < KELP_COST) return false;
  Game.gold -= KELP_COST;
  Game.plants += 1;
  Game.kelpBought = (Game.kelpBought || 0) + 1;
  Stage.spawnPlant();
  Obj.event('buykelp');
  if (!Game.tuts.saykelp) {
    Game.tuts.saykelp = 1;
    Say.say(WHISPER.kelp);
  }
  saveGame();
  return true;
};

const buyMating = () => {
  const c = matingCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.mating += 1;
  saveGame();
  return true;
};

const buyMaturity = () => {
  const c = maturityCost();
  if (Game.gold < c || Game.maturity >= 24) return false;
  Game.gold -= c;
  Game.maturity += 1;
  saveGame();
  return true;
};

const buyLongevity = () => {
  const c = longevityCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.longevity += 1;
  saveGame();
  return true;
};

const unlockNext = () => {
  const n = Game.unlocked;
  if (n >= SPECIES.length || Game.gold < SPECIES[n].cost) return false;
  Game.gold -= SPECIES[n].cost;
  Game.unlocked += 1;
  const f = { s: n, egg: true, t: 0 };
  Game.fish.push(f);
  Stage.materialize(f);
  saveGame();
  return true;
};
