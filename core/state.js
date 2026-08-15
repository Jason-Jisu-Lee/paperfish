const Game = {
  gold: 0,
  souls: 0,
  bank: 0,
  shop: 0,
  soulUp: 0,
  pStartGold: 0,
  pIncome: 0,
  pTier: [0, 0, 0, 0, 0],
  eggsBought: 0,
  incomeUp: 0,
  lifeUp: 0,
  plants: 0,
  tuts: {},
  fish: [],
  speed: 1,
  started: false
};

const SAVE_KEY = 'paperfish.save';
let skipSave = false;

const EGG_BASE = 10;
const EGG_STEP = 5;
const HATCH_TIME = 20;
const KELP_COST = 2;
const TICK = 5;
const FIRSTF_CAP = 20;

const startGold = () => 10 + Game.pStartGold * 5;
const eggCost = () => EGG_BASE + Game.eggsBought * EGG_STEP;
const soulYield = () => 1 + Game.soulUp;
const incomePer5s = () => 1 + Game.incomeUp + Game.pIncome;
const lifeOf = () => (10 + Game.lifeUp * 5) / 60;
const adultAtOf = () => lifeOf() / 2;
const hatchTime = () => HATCH_TIME;

const soulUpCost = () => 2 * 2 ** Game.soulUp;
const startGoldCost = () => 2 * 2 ** Game.pStartGold;
const pIncomeCost = () => 3 * 2 ** Game.pIncome;
const pTierCost = t => 5 * 2 ** Game.pTier[t - 2];
const incomeUpCost = () => 25 * 2 ** Game.incomeUp;
const lifeUpCost = () => 40 * 2 ** Game.lifeUp;

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

const ratePerMin = () => {
  let n = 0;
  for (const f of Game.fish) if (!f.egg && f.dying === undefined) n += 1;
  return n * incomePer5s() * (60 / TICK);
};

const saveGame = () => {
  if (skipSave || !Game.started) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 3,
      gold: Game.gold,
      souls: Game.souls,
      bank: Game.bank,
      shop: Game.shop ? 1 : 0,
      su: Game.soulUp,
      psg: Game.pStartGold,
      pin: Game.pIncome,
      pt: Game.pTier,
      eggs: Game.eggsBought,
      iu: Game.incomeUp,
      lu: Game.lifeUp,
      plants: Game.plants,
      tuts: Game.tuts || {},
      fish: Game.fish.map(f => ({
        s: f.s, egg: f.egg ? 1 : 0, t: Math.round(f.t || 0),
        a: Math.round((f.age || 0) * 100) / 100,
        h: f.hstate || 0, ha: Math.round((f.hungerAt || 0) * 100) / 100,
        d: f.dying !== undefined ? 1 : 0, ns: f.nosoul ? 1 : 0
      }))
    }));
  } catch (e) {}
};

const loadGame = () => {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d || d.v !== 3) return false;
    Game.gold = d.gold || 0;
    Game.souls = d.souls || 0;
    Game.bank = d.bank || 0;
    Game.shop = d.shop || 0;
    Game.soulUp = d.su || 0;
    Game.pStartGold = d.psg || 0;
    Game.pIncome = d.pin || 0;
    Game.pTier = Array.isArray(d.pt) && d.pt.length === 5 ? d.pt : [0, 0, 0, 0, 0];
    Game.eggsBought = d.eggs || 0;
    Game.incomeUp = d.iu || 0;
    Game.lifeUp = d.lu || 0;
    Game.plants = d.plants || 0;
    Game.tuts = d.tuts || {};
    Game.fish = (d.fish || [])
      .filter(f => f && f.s === 0)
      .map(f => {
        const o = { s: f.s, egg: !!f.egg, t: f.t || 0, age: f.a || 0, hstate: f.h || 0, hT: 0, hungerAt: f.ha || 0 };
        if (f.d) o.dying = 0;
        if (f.ns) o.nosoul = true;
        return o;
      });
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

const buyIncomeUp = () => {
  const c = incomeUpCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.incomeUp += 1;
  saveGame();
  return true;
};

const buyLifeUp = () => {
  const c = lifeUpCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.lifeUp += 1;
  saveGame();
  return true;
};
