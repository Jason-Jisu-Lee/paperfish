const Soul = (() => {
  const box = document.getElementById('soulbox');
  const num = document.getElementById('soul-num');
  const btn = document.getElementById('collect-soul');
  const modal = document.getElementById('prestige');
  const bankEl = document.getElementById('p-bank');
  const list = document.getElementById('p-list');
  let shopOpen = false;

  const PUPS = [
    {
      key: 'soulUp', cat: 'Soul', name: 'Extra Soul',
      desc: '+1 soul from each fish',
      lvl: () => Game.soulUp, cost: soulUpCost, buy: () => Game.soulUp++
    },
    {
      key: 't2', cat: 'Tier 2', name: 'Tier 2 Chance', dev: true,
      desc: '+10% Tier 2 eggs, +5% per level after',
      lvl: () => Game.pTier[0], cost: () => pTierCost(2), buy: () => Game.pTier[0]++
    },
    {
      key: 't3', cat: 'Tier 3', name: 'Tier 3 Chance', dev: true,
      desc: '+5% Tier 3 eggs, +2.5% per level after',
      lvl: () => Game.pTier[1], cost: () => pTierCost(3), buy: () => Game.pTier[1]++
    },
    {
      key: 't4', cat: 'Tier 4', name: 'Tier 4 Chance', dev: true,
      desc: '+3% Tier 4 eggs, +1.5% per level after',
      lvl: () => Game.pTier[2], cost: () => pTierCost(4), buy: () => Game.pTier[2]++
    },
    {
      key: 't5', cat: 'Tier 5', name: 'Tier 5 Chance', dev: true,
      desc: '+1.5% Tier 5 eggs, +0.75% per level after',
      lvl: () => Game.pTier[3], cost: () => pTierCost(5), buy: () => Game.pTier[3]++
    },
    {
      key: 't6', cat: 'Tier 6', name: 'Tier 6 Chance', dev: true,
      desc: '+0.5% Tier 6 eggs, +0.25% per level after',
      lvl: () => Game.pTier[4], cost: () => pTierCost(6), buy: () => Game.pTier[4]++
    },
    {
      key: 'startGold', cat: 'Gold', name: 'Starting Gold',
      desc: '+5 starting gold each run',
      lvl: () => Game.pStartGold, cost: startGoldCost, buy: () => Game.pStartGold++
    },
    {
      key: 'pIncome', cat: 'Income', name: 'Base Income',
      desc: '+1 G base income for every fish',
      lvl: () => Game.pIncome, cost: pIncomeCost, buy: () => Game.pIncome++
    }
  ];

  const renderShop = () => {
    bankEl.textContent = fmtG(Game.bank);
    let h = '', lastCat = null;
    for (const u of PUPS) {
      if (u.cat !== lastCat) {
        if (lastCat) h += '<div class="p-line"></div>';
        h += `<div class="p-cat">${u.cat}</div>`;
        lastCat = u.cat;
      }
      h += `
        <button class="prow${Game.bank < u.cost() ? ' off' : ''}" data-p="${u.key}">
          ${u.dev ? '<span class="devtag">dev</span>' : ''}
          <span class="prow-main"><span class="prow-name">${u.name}</span><span class="prow-desc">${u.desc}</span></span>
          <span class="prow-lvl">× ${u.lvl()}</span>
          <span class="prow-cost">${fmtG(u.cost())} Soul</span>
        </button>`;
    }
    list.innerHTML = h;
  };

  list.addEventListener('click', e => {
    const el = e.target.closest('[data-p]');
    if (!el) return;
    const u = PUPS.find(x => x.key === el.dataset.p);
    if (!u || Game.bank < u.cost()) return;
    Game.bank -= u.cost();
    u.buy();
    renderShop();
    saveGame();
  });

  btn.addEventListener('click', () => {
    if (!Game.started || Game.souls < 1 || shopOpen || Tut.active || Pause.paused) return;
    Game.bank += Game.souls;
    Game.souls = 0;
    Game.shop = 1;
    shopOpen = true;
    renderShop();
    modal.removeAttribute('hidden');
    saveGame();
  });

  document.getElementById('p-dive').addEventListener('click', () => {
    Game.shop = 0;
    Game.gold = startGold();
    Game.souls = 0;
    Game.eggsBought = 0;
    Game.incomeUp = 0;
    Game.lifeUp = 0;
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

  const resume = () => {
    if (Game.shop && !shopOpen) {
      shopOpen = true;
      renderShop();
      modal.removeAttribute('hidden');
    }
  };

  const closeShop = () => {
    shopOpen = false;
    modal.setAttribute('hidden', '');
  };

  return { tick, resume, closeShop, get shopOpen() { return shopOpen; } };
})();
