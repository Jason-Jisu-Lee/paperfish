const Game = {
  gold: 0,
  souls: 0,
  bank: 0,
  soulUp: 0,
  eggsBought: 0,
  plants: 0,
  tuts: {},
  fish: [],
  speed: 1,
  started: false
};

const SAVE_KEY = 'paperfish.save';
let skipSave = false;

const START_GOLD = 50;
const EGG_BASE = 50;
const EGG_STEP = 10;
const KELP_COST = 20;
const FIRSTF_CAP = 20;

const eggCost = () => EGG_BASE + Game.eggsBought * EGG_STEP;
const soulYield = () => 1 + Game.soulUp;
const soulUpCost = () => 2 * 2 ** Game.soulUp;
const adultAtOf = s => SPECIES[s].adultAt;
const lifeOf = s => SPECIES[s].life;
const hatchTime = s => SPECIES[s].hatch ?? 60;

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

const speciesPhases = s => {
  const sp = SPECIES[s];
  if (!sp._ph) {
    const dur = sp.life / sp.phases.length;
    const tick = sp.tick || 5;
    sp._ph = sp.phases.map(a => ({ dur, amt: a, tick, gpm: a * 60 / tick }));
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

const phaseVal = (s, p) => p.amt * 60 / p.tick;

const speciesGpm = (s, age) => phaseVal(s, phaseAt(s, age));

const ratePerMin = () => {
  let r = 0;
  for (const f of Game.fish) if (!f.egg && f.dying === undefined) r += speciesGpm(f.s, f.age);
  return r;
};

const saveGame = () => {
  if (skipSave || !Game.started) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 2,
      gold: Game.gold,
      souls: Game.souls,
      bank: Game.bank,
      su: Game.soulUp,
      eggs: Game.eggsBought,
      plants: Game.plants,
      tuts: Game.tuts || {},
      fish: Game.fish.map(f => ({
        s: f.s, egg: f.egg ? 1 : 0, t: Math.round(f.t || 0),
        a: Math.round((f.age || 0) * 100) / 100,
        h: f.hstate || 0, ha: Math.round((f.hungerAt || 0) * 100) / 100
      }))
    }));
  } catch (e) {}
};

const loadGame = () => {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d || d.v !== 2) return false;
    Game.gold = d.gold || 0;
    Game.souls = d.souls || 0;
    Game.bank = d.bank || 0;
    Game.soulUp = d.su || 0;
    Game.eggsBought = d.eggs || 0;
    Game.plants = d.plants || 0;
    Game.tuts = d.tuts || {};
    Game.fish = (d.fish || [])
      .filter(f => f && f.s === 0)
      .map(f => ({ s: f.s, egg: !!f.egg, t: f.t || 0, age: f.a || 0, hstate: f.h || 0, hT: 0, hungerAt: f.ha || 0 }));
    return true;
  } catch (e) { return false; }
};

const resetGame = () => {
  skipSave = true;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
};

const buyEgg = () => {
  const c = eggCost();
  if (Game.gold < c) return false;
  if (Game.fish.filter(f => f.dying === undefined).length >= FIRSTF_CAP) return false;
  Game.gold -= c;
  Game.eggsBought += 1;
  const f = { s: 0, egg: true, t: 0 };
  Game.fish.push(f);
  Stage.materialize(f);
  saveGame();
  return true;
};

const buyKelp = () => {
  if (Game.gold < KELP_COST) return false;
  Game.gold -= KELP_COST;
  Game.plants += 1;
  Stage.spawnPlant();
  saveGame();
  return true;
};
