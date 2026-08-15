const Soul = (() => {
  const box = document.getElementById('soulbox');
  const num = document.getElementById('soul-num');
  const btn = document.getElementById('collect-soul');
  const screen = document.getElementById('prestige');
  const bankEl = document.getElementById('p-bank');
  const list = document.getElementById('p-list');
  let shopOpen = false;

  const PUPS = [
    {
      key: 'startGold', cat: 'Basics', name: 'Starting Gold',
      desc: '+5 starting gold',
      lvl: () => Game.pStartGold, cost: startGoldCost, buy: () => Game.pStartGold++
    },
    {
      key: 'pIncome', cat: 'Basics', name: 'Base Income',
      desc: '+1 G / 5s to all fish',
      lvl: () => Game.pIncome, cost: pIncomeCost, buy: () => Game.pIncome++
    },
    {
      key: 'pKelp', cat: 'Basics', name: 'Starting Kelp',
      desc: 'start each run with +1 kelp',
      lvl: () => Game.pKelp, cost: pKelpCost, buy: () => Game.pKelp++,
      max: () => Game.pKelp >= PKELP_MAX,
      gate: () => Game.tuts.lifeBought
    },
    {
      key: 'soulUp', cat: 'Basics', name: 'Extra Soul',
      desc: '+1 soul per fish death',
      lvl: () => Game.soulUp, cost: soulUpCost, buy: () => Game.soulUp++
    },
    {
      key: 't2', cat: 'Tier 2', name: 'Tier 2 Chance', dev: true,
      desc: '+10% Tier 2 eggs, then +5%',
      lvl: () => Game.pTier[0], cost: () => pTierCost(2), buy: () => Game.pTier[0]++
    },
    {
      key: 't3', cat: 'Tier 3', name: 'Tier 3 Chance', dev: true,
      desc: '+5% Tier 3 eggs, then +2.5%',
      lvl: () => Game.pTier[1], cost: () => pTierCost(3), buy: () => Game.pTier[1]++
    },
    {
      key: 't4', cat: 'Tier 4', name: 'Tier 4 Chance', dev: true,
      desc: '+3% Tier 4 eggs, then +1.5%',
      lvl: () => Game.pTier[2], cost: () => pTierCost(4), buy: () => Game.pTier[2]++
    },
    {
      key: 't5', cat: 'Tier 5', name: 'Tier 5 Chance', dev: true,
      desc: '+1.5% Tier 5 eggs, then +0.75%',
      lvl: () => Game.pTier[3], cost: () => pTierCost(5), buy: () => Game.pTier[3]++
    },
    {
      key: 't6', cat: 'Tier 6', name: 'Tier 6 Chance', dev: true,
      desc: '+0.5% Tier 6 eggs, then +0.25%',
      lvl: () => Game.pTier[4], cost: () => pTierCost(6), buy: () => Game.pTier[4]++
    }
  ];

  const card = u => {
    const maxed = u.max && u.max();
    const gated = u.gate && !u.gate();
    return `
    <button class="pcard${Game.bank < u.cost() || maxed ? ' off' : ''}${gated ? ' gated' : ''}" data-p="${u.key}">
      ${u.dev ? '<span class="devtag">dev</span>' : ''}
      ${gated ? '<span class="hidtag">hidden</span>' : ''}
      ${u.lvl() > 0 ? `<span class="pc-lv">Lv ${u.lvl()}</span>` : ''}
      <span class="pc-mid"><span class="pc-name">${u.name}</span><span class="pc-cost">${maxed ? 'Max' : fmtG(u.cost()) + ' Soul'}</span></span>
      <span class="pc-desc">${u.desc}</span>
    </button>`;
  };

  const renderShop = () => {
    bankEl.textContent = fmtG(Game.bank);
    let h = '', lastCat = null;
    for (const u of PUPS) {
      if (u.cat !== lastCat) {
        if (lastCat) h += '</div>';
        h += `<div class="p-cat">${u.cat}</div><div class="p-grid">`;
        lastCat = u.cat;
      }
      h += card(u);
    }
    list.innerHTML = h + '</div>';
  };

  const open = () => {
    shopOpen = true;
    renderShop();
    screen.classList.add('fresh');
    screen.removeAttribute('hidden');
    setTimeout(() => screen.classList.remove('fresh'), 900);
  };

  list.addEventListener('click', e => {
    const el = e.target.closest('[data-p]');
    if (!el) return;
    const u = PUPS.find(x => x.key === el.dataset.p);
    if (!u || Game.bank < u.cost() || (u.max && u.max())) return;
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
    open();
    saveGame();
  });

  document.getElementById('p-dive').addEventListener('click', () => {
    Game.shop = 0;
    Game.gold = startGold();
    Game.souls = 0;
    Game.eggsBought = 0;
    Game.incomeUp = 0;
    Game.lifeUp = 0;
    Game.plants = Game.pKelp;
    Game.fish = [{ s: 0, egg: false, t: 0 }];
    Stage.resetPlants();
    Game.fish.forEach(f => Stage.materialize(f, 0));
    for (let i = 0; i < Game.plants; i++) Stage.spawnPlant(i === 0);
    Ocean.start();
    Panel.refresh();
    screen.setAttribute('hidden', '');
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
    if (Game.shop && !shopOpen) open();
  };

  const closeShop = () => {
    shopOpen = false;
    screen.setAttribute('hidden', '');
  };

  return { tick, resume, closeShop, get shopOpen() { return shopOpen; } };
})();
