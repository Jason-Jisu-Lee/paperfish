const Game = {
  gold: 0,
  paper: 0,
  bank: 0,
  shop: 0,
  paperUp: 0,
  pStartGold: 0,
  pIncome: 0,
  pKelp: 0,
  pEggUp: 0,
  pLantGold: 0,
  pLantRate: 0,
  pLantFish: 0,
  pAutoEgg: 0,
  pAdultGold: 0,
  pMature: 0,
  autoEggOn: 0,
  hideDone: 1,
  paperEarned: 0,
  pBurn: 0,
  burnUsed: 0,
  egg: { lvl: 0, t: 0 },
  hatched: 0,
  incomeUp: 0,
  eggUp: 0,
  lifeUp: 0,
  seen: { 0: 1 },
  unlocks: { income: 0, kelp: 0, life: 0, eggup: 0 },
  plants: 0,
  objs: {},
  tuts: {},
  fish: [],
  speed: 1,
  started: false
};

const SAVE_KEY = 'paperfish.save';
let skipSave = false;

const KELP_COST = 2;
const TICK = 5;
const FIRSTF_CAP = 20;

const TIER_FISH = [[0], [12, 1, 3, 4, 2, 18], [13, 7, 8, 9, 15], [14, 10, 11, 16, 17]];
const TIER_TINT = ['28,27,24', '52,112,166', '180,58,43', '203,128,14'];
const tierOf = s => TIER_FISH.findIndex(a => a.includes(s)) + 1;

const SG_GAIN = [20, 30, 40];
const SG_TOTAL = [0, 20, 50, 90];
const SG_MAX = 3;
const startGold = () => 10 + SG_TOTAL[Math.min(Game.pStartGold, SG_MAX)];
const incomePer5s = () => 1 + Game.incomeUp + Game.pIncome;
const ADULT_GOLD = 1.2;
const fishIncome = (s, adult) => {
  const g = 3 ** (tierOf(s) - 1) + Game.incomeUp + Game.pIncome;
  return Game.pAdultGold && adult ? g * ADULT_GOLD : g;
};
const PAPER_BASE = [1, 3, 12, 60];
const paperYieldOf = s => PAPER_BASE[tierOf(s) - 1] + Game.paperUp;
const UNLOCK_COST = 5;
const EGGUP_UNLOCK_COST = 10;
const lifeOf = () => (20 + Game.lifeUp * 5) / 60;
const adultAtOf = () => 30 * (1 - 0.05 * Game.pMature) / 60;
const HUNGER_FULL = 30;
const HUNGER_HATCH = 24;
const HUNGER_FIRST = 18;
const HUNGRY_AT = 0.2;
const STARVE_AT = 0.05;
const STARVE_CAP = 20;
const EAT_LOCK = 0.95;
const PELLET_SAT = 5;
const KELP_SAT = 20;
const EAT_R = 234;

const paperUpCost = () => 20 * 2 ** Game.paperUp;
const startGoldCost = () => 10 * 2 ** Game.pStartGold;
const pIncomeCost = () => 3 * 2 ** Game.pIncome;
const PKELP_MAX = 5;
const pKelpCost = () => 20;
const LIFE_UNLOCK_COST = 8;
const incomeUpCost = () => Game.incomeUp ? 25 * 2 ** (Game.incomeUp - 1) : 5;
const maxTier = () => TIER_FISH.length;
const EGGUP_MAX = 5;
const TIER_WEIGHTS = [
  [100, 0, 0, 0, 0, 0],
  [75, 25, 0, 0, 0, 0],
  [50, 35, 15, 0, 0, 0],
  [40, 30, 20, 10, 0, 0],
  [31, 26, 21, 14, 8, 0],
  [28, 23, 19, 15, 10, 5],
  [25, 21, 18, 15, 12, 9]
];
const eggLevel = () => Math.min(Game.eggUp, EGGUP_MAX) + (Game.pEggUp ? 1 : 0);
const eggRollLevel = () => Math.min(eggLevel() + Game.egg.lvl, 6);
const eggLevelTime = () => 10 * 2 ** Game.egg.lvl * 1.25 ** Game.hatched;
const tierWeights = () => TIER_WEIGHTS[eggRollLevel()].slice(0, maxTier());
const tierChance = t => {
  const w = tierWeights();
  return (w[t - 1] || 0) / w.reduce((a, b) => a + b);
};
const rollTier = () => {
  const w = tierWeights();
  let r = Math.random() * w.reduce((a, b) => a + b);
  const i = w.findIndex(x => (r -= x) < 0);
  return i < 0 ? w.length : i + 1;
};
const eggUpCost = () => 25 * 2 ** Game.eggUp;
const lifeUpCost = () => 40 * 2 ** Game.lifeUp;

const PLANTGOLD_MAX = 10;
const PLANTRATE_MAX = 5;
const PLANTFISH_MAX = 5;
const lantGold = () => 2 + Game.pLantGold;
const lantMin = () => 15 - Game.pLantRate;
const lantMax = () => 17 - Game.pLantRate;
const lantTapChance = () => 0.04 * Game.pLantFish;
const pLantGoldCost = () => 12 * 2 ** Game.pLantGold;
const pLantRateCost = () => 150 * 2 ** Game.pLantRate;
const pLantFishCost = () => 200 * 2 ** Game.pLantFish;
const pAutoEggCost = () => 50;
const pAdultGoldCost = () => 100;
const pBurnCost = () => 500;
const pEggUpCost = () => 500;
const KELP_UNLOCK_COST = 50;
const PMATURE_MAX = 4;
const pMatureCost = () => 100 * 2 ** Game.pMature;

const doBurn = () => {
  if (!Game.pBurn || Game.burnUsed || !Game.started) return false;
  Game.burnUsed = 1;
  for (const f of Game.fish) if (!f.egg && f.dying === undefined) f.age = (f.age || 0) + 1;
  saveGame();
  return true;
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

const fmtG1 = v => {
  const r = Math.round(v * 10) / 10;
  return r < 10 && !Number.isInteger(r) ? r.toFixed(1) : fmtG(Math.round(v));
};

const fmtPct = c => c >= 0.995 ? '100%' : c >= 0.01 ? Math.round(c * 100) + '%' : c > 0 ? '&lt;1%' : '0%';

const ratePerMin = () => {
  let r = 0;
  for (const f of Game.fish) if (!f.egg && f.dying === undefined) r += fishIncome(f.s, f.adult);
  return r * (60 / TICK);
};

const saveGame = () => {
  if (skipSave || !Game.started) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 4,
      gold: Game.gold,
      paper: Game.paper,
      bank: Game.bank,
      shop: Game.shop ? 1 : 0,
      su: Game.paperUp,
      psg: Game.pStartGold,
      pin: Game.pIncome,
      pkl: Game.pKelp,
      peu: Game.pEggUp,
      plg: Game.pLantGold,
      plr: Game.pLantRate,
      plf: Game.pLantFish,
      pae: Game.pAutoEgg,
      pag: Game.pAdultGold,
      pm: Game.pMature,
      aeo: Game.autoEggOn ? 1 : 0,
      hd: Game.hideDone ? 1 : 0,
      se: Math.round(Game.paperEarned),
      pb: Game.pBurn,
      bu: Game.burnUsed,
      el: Game.egg.lvl,
      et: Math.round(Game.egg.t * 10) / 10,
      ht: Game.hatched,
      iu: Game.incomeUp,
      eu: Game.eggUp,
      lu: Game.lifeUp,
      sn: Game.seen,
      un: Game.unlocks,
      plants: Game.plants,
      objs: Game.objs || {},
      tuts: Game.tuts || {},
      fish: Game.fish.map(f => ({
        s: f.s,
        a: Math.round((f.age || 0) * 100) / 100,
        h: f.hstate || 0, hu: Math.round((f.hunger ?? HUNGER_FULL) * 100) / 100,
        d: f.dying !== undefined ? 1 : 0
      }))
    }));
  } catch (e) {}
};

const loadGame = () => {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d || d.v !== 4) return false;
    Game.gold = d.gold || 0;
    Game.paper = d.paper || 0;
    Game.bank = d.bank || 0;
    Game.shop = d.shop || 0;
    Game.paperUp = d.su || 0;
    Game.pStartGold = d.psg || 0;
    Game.pIncome = d.pin || 0;
    Game.pKelp = d.pkl || 0;
    Game.pEggUp = d.peu || 0;
    Game.pLantGold = d.plg || 0;
    Game.pLantRate = d.plr || 0;
    Game.pLantFish = d.plf || 0;
    Game.pAutoEgg = d.pae || 0;
    Game.pAdultGold = d.pag || 0;
    Game.pMature = d.pm || 0;
    Game.autoEggOn = d.aeo ?? 0;
    Game.hideDone = d.hd ?? 1;
    Game.paperEarned = d.se ?? (d.paper || 0) + (d.bank || 0);
    Game.pBurn = d.pb || 0;
    Game.burnUsed = d.bu || 0;
    Game.egg = { lvl: d.el || 0, t: d.et || 0 };
    Game.hatched = d.ht || 0;
    Game.incomeUp = d.iu || 0;
    Game.eggUp = Math.min(d.eu || 0, EGGUP_MAX);
    Game.lifeUp = d.lu || 0;
    Game.seen = d.sn || { 0: 1 };
    Game.unlocks = Object.assign({ income: 0, kelp: 0, life: 0, eggup: 0 }, d.un || {});
    Game.plants = d.plants || 0;
    Game.objs = d.objs || {};
    Game.tuts = d.tuts || {};
    Game.fish = (d.fish || [])
      .filter(f => f && !f.egg && tierOf(f.s) > 0)
      .map(f => {
        const o = { s: f.s, egg: false, t: 0, age: f.a || 0, hstate: f.h || 0, hT: 0, hunger: f.hu ?? HUNGER_FULL };
        if (f.d) o.dying = 0;
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

const hatchEgg = () => {
  if (Tut.eggLocked()) return false;
  if (Game.fish.filter(f => f.dying === undefined).length >= FIRSTF_CAP) return false;
  Game.tuts.eggBought = 1;
  const t = rollTier();
  const pool = TIER_FISH[t - 1];
  const f = { s: pool[Math.floor(Math.random() * pool.length)], egg: false, t: 0 };
  Game.seen[f.s] = 1;
  Game.fish.push(f);
  Stage.hatchAt(f);
  Game.hatched += 1;
  Game.egg = { lvl: 0, t: 0 };
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

const buyEggUp = () => {
  if (Game.eggUp >= EGGUP_MAX) return false;
  const c = eggUpCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.eggUp += 1;
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

