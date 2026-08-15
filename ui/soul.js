const Soul = (() => {
  const box = document.getElementById('soulbox');
  const num = document.getElementById('soul-num');
  const btn = document.getElementById('collect-soul');
  const modal = document.getElementById('prestige');
  const bankEl = document.getElementById('p-bank');
  const upLvl = document.getElementById('p-soulup-lvl');
  const upCost = document.getElementById('p-soulup-cost');
  const upBtn = document.getElementById('p-soulup');
  let shopOpen = false;

  const renderShop = () => {
    bankEl.textContent = fmtG(Game.bank);
    upLvl.textContent = '× ' + Game.soulUp;
    upCost.textContent = fmtG(soulUpCost()) + ' Soul';
    upBtn.classList.toggle('off', Game.bank < soulUpCost());
  };

  btn.addEventListener('click', () => {
    if (!Game.started || Game.souls < 1 || shopOpen) return;
    Game.bank += Game.souls;
    Game.souls = 0;
    shopOpen = true;
    renderShop();
    modal.removeAttribute('hidden');
    saveGame();
  });

  upBtn.addEventListener('click', () => {
    if (Game.bank < soulUpCost()) return;
    Game.bank -= soulUpCost();
    Game.soulUp += 1;
    renderShop();
    saveGame();
  });

  document.getElementById('p-dive').addEventListener('click', () => {
    Game.gold = START_GOLD;
    Game.souls = 0;
    Game.eggsBought = 0;
    Game.plants = 0;
    Game.fish = [{ s: 0, egg: false, t: 0 }];
    Stage.resetPlants();
    Game.fish.forEach(f => Stage.materialize(f, 0));
    Ocean.start();
    Panel.refresh();
    modal.setAttribute('hidden', '');
    shopOpen = false;
    saveGame();
  });

  const tick = () => {
    if (!Game.started) {
      box.setAttribute('hidden', '');
      return;
    }
    box.removeAttribute('hidden');
    num.textContent = fmtG(Game.souls);
    btn.classList.toggle('off', Game.souls < 1);
  };

  return { tick, get shopOpen() { return shopOpen; } };
})();
