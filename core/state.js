const Game = {
  gold: 0,
  souls: 0,
  bank: 0,
  shop: 0,
  soulUp: 0,
  pStartGold: 0,
  pIncome: 0,
  pKelp: 0,
  pLife: 0,
  pLife2: 0,
  pTier: [0, 0, 0, 0, 0],
  pLantGold: 0,
  pLantRate: 0,
  pLantFish: 0,
  pAutoEgg: 0,
  eggsBought: 0,
  incomeUp: 0,
  eggUp: 0,
  lifeUp: 0,
  seen: { 0: 1 },
  plants: 0,
  objs: {},
  tuts: {},
  fish: [],
  speed: 1,
  started: false
};

const SAVE_KEY = 'paperfish.save';
let skipSave = false;

const EGG_COSTS = [5, 7, 12, 20, 25, 30, 40, 50, 70, 90, 120, 150, 200, 250, 300];
const TIER_HATCH = [8, 12, 20, 30, 45, 60];
const KELP_COST = 2;
const TICK = 5;
const FIRSTF_CAP = 20;

const TIER_FISH = [[0, 1], [2, 3, 4, 5], [6, 7, 8, 9], [10, 11]];
const tierOf = s => TIER_FISH.findIndex(a => a.includes(s)) + 1;

const startGold = () => 10 + Game.pStartGold * 5;
const eggCost = () => {
  const n = Game.eggsBought;
  if (n < EGG_COSTS.length) return EGG_COSTS[n];
  const raw = 300 * 1.3 ** (n - EGG_COSTS.length + 1);
  const mag = 10 ** Math.floor(Math.log10(raw) - 1);
  return Math.round(raw / mag) * mag;
};
const soulYield = () => 1 + Game.soulUp;
const incomePer5s = () => 1 + Game.incomeUp + Game.pIncome;
const lifeOf = () => (20 + Game.pLife * 5 + Game.pLife2 * 10 + Game.lifeUp * 5) / 60;
const adultAtOf = () => 30 / 60;
const HUNGER_AT = 20 / 60;
const hatchTime = () => TIER_HATCH[0];

const soulUpCost = () => 20 * 2 ** Game.soulUp;
const startGoldCost = () => 4 * 2 ** Game.pStartGold;
const pIncomeCost = () => 3 * 2 ** Game.pIncome;
const PKELP_MAX = 5;
const pKelpCost = () => 5;
const pLifeCost = () => [2, 5, 10, 20][Game.pLife] ?? 20 * 2 ** (Game.pLife - 3);
const pLife2Cost = () => 15 * 2 ** Game.pLife2;
const pTierCost = t => 30 * 10 ** (t - 2) * 2 ** Game.pTier[t - 2];
const incomeUpCost = () => 25 * 2 ** Game.incomeUp;
const EGGUP_MAX = 5;
const eggChance = () => 0.1 * Game.eggUp;
const eggUpCost = () => 40 * 2 ** Game.eggUp;
const lifeUpCost = () => 40 * 2 ** Game.lifeUp;

const PLANTGOLD_MAX = 10;
const PLANTRATE_MAX = 5;
const PLANTFISH_MAX = 5;
const lantGold = () => 1 + Game.pLantGold;
const lantMin = () => 15 - Game.pLantRate;
const lantMax = () => 17 - Game.pLantRate;
const lantTapChance = () => 0.04 * Game.pLantFish;
const pLantGoldCost = () => 3 * 2 ** Game.pLantGold;
const pLantRateCost = () => 150 * 2 ** Game.pLantRate;
const pLantFishCost = () => 10 * 2 ** Game.pLantFish;
const pAutoEggCost = () => 20;

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
      pkl: Game.pKelp,
      pl: Game.pLife,
      pl2: Game.pLife2,
      pt: Game.pTier,
      plg: Game.pLantGold,
      plr: Game.pLantRate,
      plf: Game.pLantFish,
      pae: Game.pAutoEgg,
      eggs: Game.eggsBought,
      iu: Game.incomeUp,
      eu: Game.eggUp,
      lu: Game.lifeUp,
      sn: Game.seen,
      plants: Game.plants,
      objs: Game.objs || {},
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
    Game.pKelp = d.pkl || 0;
    Game.pLife = d.pl || 0;
    Game.pLife2 = d.pl2 || 0;
    Game.pTier = Array.isArray(d.pt) && d.pt.length === 5 ? d.pt : [0, 0, 0, 0, 0];
    Game.pLantGold = d.plg || 0;
    Game.pLantRate = d.plr || 0;
    Game.pLantFish = d.plf || 0;
    Game.pAutoEgg = d.pae || 0;
    Game.eggsBought = d.eggs || 0;
    Game.incomeUp = d.iu || 0;
    Game.eggUp = d.eu || 0;
    Game.lifeUp = d.lu || 0;
    Game.seen = d.sn || { 0: 1 };
    Game.plants = d.plants || 0;
    Game.objs = d.objs || {};
    Game.tuts = d.tuts || {};
    Game.fish = (d.fish || [])
      .filter(f => f && TIER_FISH[0].includes(f.s))
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
  Game.tuts.eggBought = 1;
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

