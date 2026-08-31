const Game = {
  gold: 0,
  paper: 0,
  bank: 0,
  shop: 0,
  paperUp: 0,
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
  pAdultGold: 0,
  pMature: 0,
  autoEggOn: 1,
  hideDone: 1,
  paperEarned: 0,
  pBurn: 0,
  burnUsed: 0,
  eggsBought: 0,
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

const EGG_COSTS = [2, 3, 5, 8, 12, 20, 25, 30, 40, 50, 70, 90, 120, 150, 200, 250, 300];
const EGG_CD = 500;
let eggCdUntil = 0;
const eggCd = () => Game.devMode ? 0 : Math.max(eggCdUntil - Date.now(), 0);
const TIER_HATCH = [8, 12, 20, 30, 45, 60];
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
const eggCost = () => {
  const n = Game.eggsBought;
  if (n < EGG_COSTS.length) return EGG_COSTS[n];
  const raw = 300 * 1.3 ** (n - EGG_COSTS.length + 1);
  const mag = 10 ** Math.floor(Math.log10(raw) - 1);
  return Math.round(raw / mag) * mag;
};
const incomePer5s = () => 1 + Game.incomeUp + Game.pIncome;
const ADULT_GOLD = 1.2;
const fishIncome = (s, adult) => {
  const g = 3 ** (tierOf(s) - 1) + Game.incomeUp + Game.pIncome;
  return Game.pAdultGold && adult && tierOf(s) >= 3 ? g * ADULT_GOLD : g;
};
const PAPER_BASE = [1, 3, 12, 60];
const paperYieldOf = s => PAPER_BASE[tierOf(s) - 1] + Game.paperUp;
const UNLOCK_COST = 5;
const EGGUP_UNLOCK_COST = 10;
const lifeOf = () => (20 + Game.pLife * 5 + Game.pLife2 * 10 + Game.lifeUp * 5) / 60;
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
const hatchTime = () => TIER_HATCH[0];

const paperUpCost = () => 20 * 2 ** Game.paperUp;
const startGoldCost = () => 10 * 2 ** Game.pStartGold;
const pIncomeCost = () => 3 * 2 ** Game.pIncome;
const PKELP_MAX = 5;
const pKelpCost = () => 20;
const pLifeCost = () => 10 * 2 ** Game.pLife;
const pLife2Cost = () => 50 * 2 ** Game.pLife2;
const incomeUpCost = () => Game.incomeUp ? 25 * 2 ** (Game.incomeUp - 1) : 5;
const maxTier = () => TIER_FISH.length;
const eggUpMax = () => 3 * (maxTier() - 2) + 9;
const tierRung = r => Math.min(Math.max(0.1 * (Game.eggUp - 3 * (r - 1)), 0), 0.9);
const tierChance = t => {
  const m = maxTier();
  if (t > m) return 0;
  let c = 1;
  for (let r = 1; r < t; r++) c *= tierRung(r);
  return t < m ? c * (1 - tierRung(t)) : c;
};
const eggUpCost = () => Math.round(25 * 1.25 ** Game.eggUp);
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
      pl: Game.pLife,
      pl2: Game.pLife2,
      pt: Game.pTier,
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
      eggs: Game.eggsBought,
      iu: Game.incomeUp,
      eu: Game.eggUp,
      lu: Game.lifeUp,
      sn: Game.seen,
      un: Game.unlocks,
      plants: Game.plants,
      objs: Game.objs || {},
      tuts: Game.tuts || {},
      fish: Game.fish.map(f => ({
        s: f.s, egg: f.egg ? 1 : 0, t: Math.round(f.t || 0),
        a: Math.round((f.age || 0) * 100) / 100,
        h: f.hstate || 0, hu: Math.round((f.hunger ?? HUNGER_FULL) * 100) / 100,
        d: f.dying !== undefined ? 1 : 0, ns: f.nopaper ? 1 : 0
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
    Game.pLife = d.pl || 0;
    Game.pLife2 = d.pl2 || 0;
    Game.pTier = Array.isArray(d.pt) && d.pt.length === 5 ? d.pt : [0, 0, 0, 0, 0];
    Game.pLantGold = d.plg || 0;
    Game.pLantRate = d.plr || 0;
    Game.pLantFish = d.plf || 0;
    Game.pAutoEgg = d.pae || 0;
    Game.pAdultGold = d.pag || 0;
    Game.pMature = d.pm || 0;
    Game.autoEggOn = d.aeo ?? 1;
    Game.hideDone = d.hd ?? 1;
    Game.paperEarned = d.se ?? (d.paper || 0) + (d.bank || 0);
    Game.pBurn = d.pb || 0;
    Game.burnUsed = d.bu || 0;
    Game.eggsBought = d.eggs || 0;
    Game.incomeUp = d.iu || 0;
    Game.eggUp = d.eu || 0;
    Game.lifeUp = d.lu || 0;
    Game.seen = d.sn || { 0: 1 };
    Game.unlocks = Object.assign({ income: 0, kelp: 0, life: 0, eggup: 0 }, d.un || {});
    Game.plants = d.plants || 0;
    Game.objs = d.objs || {};
    Game.tuts = d.tuts || {};
    Game.fish = (d.fish || [])
      .filter(f => f && tierOf(f.s) > 0)
      .map(f => {
        const o = { s: f.s, egg: !!f.egg, t: f.t || 0, age: f.a || 0, hstate: f.h || 0, hT: 0, hunger: f.hu ?? HUNGER_FULL };
        if (f.d) o.dying = 0;
        if (f.ns) o.nopaper = true;
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
  if (eggCd()) return false;
  const c = eggCost();
  if (Game.gold < c) return false;
  if (Game.fish.filter(f => f.dying === undefined).length >= FIRSTF_CAP) return false;
  eggCdUntil = Date.now() + EGG_CD;
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
  if (Game.eggUp >= eggUpMax()) return false;
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

