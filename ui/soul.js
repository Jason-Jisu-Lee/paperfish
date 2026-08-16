const Soul = (() => {
  const box = document.getElementById('soulbox');
  const num = document.getElementById('soul-num');
  const btn = document.getElementById('collect-soul');
  const screen = document.getElementById('prestige');
  const bankEl = document.getElementById('p-bank');
  const list = document.getElementById('p-list');
  const tabs = document.getElementById('p-tabs');
  const tip = document.getElementById('pctip');
  let shopOpen = false, tab = 'up';

  const ICO = {
    gold: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><rect x="9.8" y="9.8" width="4.4" height="4.4" rx=".5"/></svg>',
    income: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.2"/><path d="M12 8 V16"/><path d="M8 12 H16"/></svg>',
    kelp: '<svg viewBox="0 0 24 24"><path d="M12 21.5 C8.6 17.4 8.4 13.2 9.6 9.6 C10.3 7.1 11.3 4.9 12.8 2.9 C14.5 5.2 15.1 8 14.6 10.9 C14.1 14.2 13.9 17.9 12 21.5 Z"/><path d="M12.1 19 C11.7 15.4 11.9 11.6 12.6 5.8"/></svg>',
    soul: '<svg viewBox="0 0 24 24"><path d="M12 3.4 C15.6 8.2 18.2 11.2 18.2 14.4 C18.2 17.8 15.4 20.4 12 20.4 C8.6 20.4 5.8 17.8 5.8 14.4 C5.8 11.2 8.4 8.2 12 3.4 Z"/></svg>',
    life: '<svg viewBox="0 0 24 24"><path d="M12 21 C12 18 12 16 12 13.5"/><path d="M12 13.5 C6.5 13.5 5 9.5 4.8 6.2 C9.8 6.6 11.8 9.8 12 13.5 Z"/><path d="M12 13.5 C16.2 13.2 17.6 10.4 18 7.6 C14.2 8 12.3 10.4 12 13.5 Z"/></svg>',
    egg: '<svg viewBox="-23 -29 46 58"><path d="M0,-24 C13,-24 19,-9 19,3 C19,17 10,25 0,25 C-10,25 -19,17 -19,3 C-19,-9 -13,-24 0,-24"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5.5" y="10.8" width="13" height="8.7" rx="2"/><path d="M8.6 10.8 V8.4 a3.4 3.4 0 0 1 6.8 0 V10.8"/></svg>'
  };

  const CORE = [
    { key: 'startGold', ico: 'gold', name: 'Starting Gold', desc: 'Begin every dive with 5 more gold.',
      lvl: () => Game.pStartGold, cost: startGoldCost, buy: () => Game.pStartGold++ },
    { key: 'pIncome', ico: 'income', name: 'Base Income', desc: 'Every fish earns 1 more gold each tick, forever.',
      lvl: () => Game.pIncome, cost: pIncomeCost, buy: () => Game.pIncome++ },
    { key: 'pKelp', ico: 'kelp', name: 'Starting Kelp', desc: 'Begin every dive with 1 more kelp already floating.',
      lvl: () => Game.pKelp, cost: pKelpCost, buy: () => Game.pKelp++,
      max: () => Game.pKelp >= PKELP_MAX, gate: () => Game.pLife > 0 },
    { key: 'soulUp', ico: 'soul', name: 'Extra Soul', desc: 'Every fish leaves 1 more soul when it dies.',
      lvl: () => Game.soulUp, cost: soulUpCost, buy: () => Game.soulUp++ }
  ];

  const TIERS = [
    { tier: 1, ups: [
      { key: 'pLife', ico: 'life', name: 'Lifespan', desc: 'Tier 1 fish live 5 seconds longer.',
        lvl: () => Game.pLife, cost: pLifeCost, buy: () => Game.pLife++ }
    ] },
    ...[2, 3, 4, 5, 6].map(t => ({ tier: t, ups: [
      { key: 't' + t, ico: 'egg', name: 'Hatch Chance', dev: true,
        desc: `Eggs are more likely to hatch a Tier ${t} fish.`,
        lvl: () => Game.pTier[t - 2], cost: () => pTierCost(t), buy: () => Game.pTier[t - 2]++ }
    ] }))
  ];

  const ALL = [...CORE, ...TIERS.flatMap(t => t.ups)];
  const tierOpen = t => t <= 2 || Game.pTier[t - 3] >= 1;

  const card = (u, locked) => {
    const maxed = u.max && u.max();
    const gated = u.gate && !u.gate();
    const lv = u.lvl();
    const off = locked || maxed || Game.bank < u.cost();
    return `
      <button class="pcard${off ? ' off' : ''}${locked ? ' locked' : ''}${lv > 0 ? ' owned' : ''}" data-p="${u.key}">
        ${u.dev ? '<span class="devtag">dev</span>' : ''}
        ${gated ? '<span class="hidtag">hidden</span>' : ''}
        ${lv > 0 ? `<span class="pc-lv">${lv}</span>` : ''}
        <span class="pc-ico">${locked ? ICO.lock : ICO[u.ico]}</span>
        <span class="pc-name">${locked ? 'Locked' : u.name}</span>
        <span class="pc-cost">${locked ? '&mdash;' : maxed ? 'Max' : fmtG(u.cost()) + ' Soul'}</span>
      </button>`;
  };

  const seen = s => s === 0;

  const fiCard = s => {
    const sp = SPECIES[s];
    const known = seen(s);
    let inner = sp.paths.map(d => `<path d="${d}"/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `
      <div class="fi-card${known ? '' : ' unknown'}">
        <span class="fi-art"><svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg></span>
        <span class="fi-name">${known ? sp.name : '???'}</span>
      </div>`;
  };

  const render = () => {
    bankEl.textContent = fmtG(Game.bank);
    let h = '';
    if (tab === 'up') {
      h = `<div class="p-cat">Core</div><div class="p-grid">${CORE.map(u => card(u, false)).join('')}</div>`;
    } else if (tab === 'tier') {
      for (const t of TIERS) {
        const locked = !tierOpen(t.tier);
        h += `<div class="p-cat${locked ? ' dim' : ''}">Tier ${t.tier}</div>` +
          `<div class="p-grid">${t.ups.map(u => card(u, locked)).join('')}</div>`;
      }
    } else {
      TIER_FISH.forEach((arr, i) => {
        h += `<div class="fi-head">
            <span class="fi-seal">${i + 1}</span>
            <span class="fi-t">Tier ${i + 1}</span>
            <span class="fi-count">${arr.filter(seen).length} / ${arr.length}</span>
          </div>
          <div class="fi-grid">${arr.map(fiCard).join('')}</div>`;
      });
    }
    list.innerHTML = h;
  };

  tabs.addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    for (const t of tabs.children) t.classList.toggle('on', t === b);
    tip.setAttribute('hidden', '');
    render();
  });

  list.addEventListener('click', e => {
    const el = e.target.closest('[data-p]');
    if (!el || el.classList.contains('locked')) return;
    const u = ALL.find(x => x.key === el.dataset.p);
    if (!u || Game.bank < u.cost() || (u.max && u.max())) return;
    Game.bank -= u.cost();
    u.buy();
    render();
    tip.setAttribute('hidden', '');
    saveGame();
  });

  list.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-p]');
    if (!el) return;
    const u = ALL.find(x => x.key === el.dataset.p);
    if (!u) return;
    const locked = el.classList.contains('locked');
    tip.innerHTML = locked
      ? '<span class="pct-name">Locked</span>Own the tier before this one to unlock it.'
      : `<span class="pct-name">${u.name}</span>${u.desc}`;
    const r = el.getBoundingClientRect();
    tip.removeAttribute('hidden');
    const tw = tip.getBoundingClientRect().width;
    tip.style.left = Math.min(Math.max(r.left + r.width / 2 - tw / 2, 12), innerWidth - tw - 12) + 'px';
    tip.style.top = (r.bottom + 10) + 'px';
  });
  list.addEventListener('mouseout', e => {
    if (e.target.closest('[data-p]')) tip.setAttribute('hidden', '');
  });

  const open = () => {
    shopOpen = true;
    render();
    screen.classList.add('fresh');
    screen.removeAttribute('hidden');
    setTimeout(() => screen.classList.remove('fresh'), 900);
  };

  const bankAndOpen = () => {
    Game.bank += Game.souls;
    Game.souls = 0;
    open();
    saveGame();
  };

  btn.addEventListener('click', () => {
    if (!Game.started || Game.souls < 1 || shopOpen || Tut.active || Pause.paused) return;
    Game.bank += Game.souls;
    Game.souls = 0;
    Game.shop = 1;
    saveGame();
    if (Obj.event('collectsoul')) setTimeout(bankAndOpen, 2200);
    else open();
  });

  document.getElementById('p-dive').addEventListener('click', () => {
    Game.shop = 0;
    Game.tuts.prestiged = 1;
    Game.gold = startGold();
    Game.souls = 0;
    Game.eggsBought = 0;
    Game.incomeUp = 0;
    Game.objs = {};
    Game.plants = Game.pKelp;
    Game.fish = [{ s: 0, egg: false, t: 0 }];
    Stage.resetPlants();
    Game.fish.forEach(f => Stage.materialize(f, 0));
    for (let i = 0; i < Game.plants; i++) Stage.spawnPlant(i === 0);
    Ocean.start();
    Panel.refresh();
    Obj.start();
    screen.setAttribute('hidden', '');
    tip.setAttribute('hidden', '');
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
    if (!Game.tuts.soulOpen && Game.souls >= 2) {
      Game.tuts.soulOpen = 1;
      btn.removeAttribute('hidden');
      Obj.start();
      saveGame();
    }
    if (Game.tuts.soulOpen) {
      btn.removeAttribute('hidden');
      btn.classList.toggle('off', Game.souls < 1);
    }
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
