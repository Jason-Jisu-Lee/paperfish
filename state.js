const Game = {
  gold: 0,
  stream: 0,
  plants: 0,
  unlocked: 1,
  fish: [],
  speed: 1,
  started: false
};

const SAVE_KEY = 'paperfish.save';
let skipSave = false;

const streamCost = () => 30 * 2 ** Game.stream;
const KELP_COST = 200;
const HATCH_SECONDS = 60;

const ratePerMin = () => {
  let r = 0;
  for (const f of Game.fish) if (!f.egg) r += SPECIES[f.s].gpm + Game.stream;
  return r + Game.plants;
};

const saveGame = () => {
  if (skipSave || !Game.started) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1,
      gold: Game.gold,
      stream: Game.stream,
      plants: Game.plants,
      unlocked: Game.unlocked,
      fish: Game.fish.map(f => ({ s: f.s, egg: f.egg ? 1 : 0, t: Math.round(f.t || 0) }))
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
    Game.fish = (d.fish || [])
      .filter(f => f && f.s >= 0 && f.s < SPECIES.length)
      .map(f => ({ s: f.s, egg: !!f.egg, t: f.t || 0 }));
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
  Game.gold -= SPECIES[s].cost;
  const f = { s, egg: true, t: 0 };
  Game.fish.push(f);
  Stage.materialize(f);
  saveGame();
  return true;
};

const buyStream = () => {
  const c = streamCost();
  if (Game.gold < c) return false;
  Game.gold -= c;
  Game.stream += 1;
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

const unlockNext = () => {
  const n = Game.unlocked;
  if (n >= SPECIES.length || Game.gold < SPECIES[n].unlock) return false;
  Game.gold -= SPECIES[n].unlock;
  Game.unlocked += 1;
  saveGame();
  return true;
};
