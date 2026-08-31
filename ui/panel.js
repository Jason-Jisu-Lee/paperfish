const Panel = (() => {
  const fmt = fmtG;
  const goldNum = document.getElementById('gold-num');
  const goldRate = document.getElementById('gold-rate');
  const goldSrc = document.getElementById('goldsrc');
  const upGrid = document.getElementById('up-grid');
  const fishGrid = document.getElementById('fish-grid');
  const uptip = document.getElementById('uptip');
  const railFood = document.getElementById('rail-food');
  const railIncome = document.getElementById('rail-income');
  const railLife = document.getElementById('rail-life');

  const UPS = [
    {
      key: 'income', name: 'Income', cat: 'income', unlock: 'income',
      cost: incomeUpCost, lvl: () => Game.incomeUp, buy: buyIncomeUp,
      desc: '+1 G / 5s for every fish',
      cur: () => 'Current: ' + fmt(incomePer5s()) + ' G / 5s'
    },
    {
      key: 'kelp', name: 'Kelp', cat: 'food', unlock: 'kelp',
      cost: () => KELP_COST, lvl: () => Game.plants, buy: buyKelp,
      desc: 'two bites, one bite satisfies hunger for 20s',
      cur: () => 'Current: × ' + Game.plants + ' floating'
    },
    {
      key: 'eggup', name: 'Fish Tier', cat: 'fish', unlock: 'eggup',
      icon: '<svg viewBox="-26 -32 52 64"><path d="M0,-24 C13,-24 19,-9 19,3 C19,17 10,25 0,25 C-10,25 -19,17 -19,3 C-19,-9 -13,-24 0,-24"/><path class="chev" d="M-7.5,7 L0,-3.5 L7.5,7"/></svg>',
      cost: eggUpCost, lvl: () => Game.eggUp, buy: buyEggUp,
      maxed: () => Game.eggUp >= eggUpMax(),
      desc: 'eggs may hatch higher tiers; every 5th level opens a new tier',
      cur: () => 'Current: up to Tier ' + (Game.eggUp ? Math.min(2 + Math.floor(Game.eggUp / 5), maxTier()) : 1)
    },
    {
      key: 'life', name: 'Lifespan', cat: 'life', unlock: 'life',
      cost: lifeUpCost, lvl: () => Game.lifeUp, buy: buyLifeUp,
      desc: 'every fish lives 5 seconds longer this run',
      cur: () => 'Current: ' + Math.round(lifeOf() * 60) + 's'
    }
  ];

  const owned = u => !u.unlock || Game.unlocks[u.unlock];

  let cat = 'fish';

  const thumb = s => {
    const sp = SPECIES[s];
    const st = sp.tint ? ` style="stroke:rgb(${sp.tint})"` : '';
    let inner = sp.paths.map(d => `<path d="${d}" vector-effect="non-scaling-stroke"${st}/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"${sp.tint ? ` style="fill:rgb(${sp.tint})"` : ''}/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `<span class="thumb"><svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg></span>`;
  };

  const living = () => Game.fish.filter(f => f.dying === undefined).length;

  const ucard = u => `
      <button class="ubtn${u.maxed && u.maxed() ? ' off' : ''}" data-key="${u.key}">
        <span class="ubtn-lvl">× ${u.lvl()}</span>
        ${u.icon ? `<span class="ubtn-icon eggicon">${u.icon}</span>` : `<span class="ubtn-name">${u.name}</span>`}
        <span class="ubtn-cost">${u.maxed && u.maxed() ? 'Max' : fmt(u.cost()) + ' G'}</span>
      </button>`;

  const refresh = () => {
    railFood.toggleAttribute('hidden', !Game.unlocks.kelp);
    document.getElementById('burn').toggleAttribute('hidden', !(Game.pBurn && !Game.burnUsed));
    railIncome.toggleAttribute('hidden', !Game.unlocks.income);
    railLife.toggleAttribute('hidden', !Game.unlocks.life);
    upGrid.innerHTML = UPS.filter(u => u.cat === cat && owned(u)).map(ucard).join('');

    fishGrid.innerHTML = `
      <button class="ubtn" data-egg>
        <span class="ubtn-icon eggicon"><svg viewBox="-24 -30 48 60"><path d="M0,-24 C13,-24 19,-9 19,3 C19,17 10,25 0,25 C-10,25 -19,17 -19,3 C-19,-9 -13,-24 0,-24"/></svg></span>
        <span class="ubtn-cost">${fmt(eggCost())} G</span>
        <i class="eggcd" hidden></i>
      </button>` + (Game.pAutoEgg ? `
      <button class="ubtn autoegg" data-autoegg>
        <span class="ubtn-name">Auto Egg</span>
        <span class="toggle${Game.autoEggOn ? ' on' : ''}"><span class="tknob"></span></span>
      </button>` : '') + UPS.filter(u => u.cat === 'fish' && owned(u)).map(ucard).join('');
    tick();
  };

  const goldEl = document.querySelector('.gold');
  let lastGold = -1;

  const tick = () => {
    const g = Math.floor(Game.gold);
    if (g > lastGold && lastGold >= 0) {
      goldEl.classList.remove('bump');
      void goldEl.offsetWidth;
      goldEl.classList.add('bump');
    }
    lastGold = g;
    goldNum.textContent = fmt(Game.gold);
    goldRate.textContent = '+' + fmt(ratePerMin()) + ' G / min';
    const eb = fishGrid.querySelector('[data-egg]');
    if (eb) {
      const cd = eggCd();
      eb.classList.toggle('off', Game.gold < eggCost() || living() >= FIRSTF_CAP || cd > 0);
      eb.classList.toggle('pulse', !Game.tuts.eggBought);
      const bar = eb.querySelector('.eggcd');
      bar.toggleAttribute('hidden', !cd);
      if (cd) bar.style.width = (cd / EGG_CD * 100) + '%';
    }
    for (const el of document.querySelectorAll('#up-grid [data-key], #fish-grid [data-key]')) {
      const u = UPS.find(x => x.key === el.dataset.key);
      el.classList.toggle('off', (u.maxed && u.maxed()) || Game.gold < u.cost());
    }
  };

  const srcBuild = () => {
    let n = 0;
    for (const f of Game.fish) if (!f.egg && f.dying === undefined) n += 1;
    goldSrc.innerHTML = n
      ? `<div class="gs-row">${thumb(0)}<span class="gs-n">× ${n}</span><span class="gs-amt">+${fmt(ratePerMin())} G / min</span></div>`
      : '<div class="gs-row"><span class="gs-n">no fish earning</span></div>';
  };

  goldRate.addEventListener('mouseenter', () => {
    srcBuild();
    goldSrc.removeAttribute('hidden');
  });
  goldRate.addEventListener('mouseleave', () => goldSrc.setAttribute('hidden', ''));

  document.querySelector('.rail').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.dataset.cat;
    for (const rb of document.querySelectorAll('.rail [data-cat]')) rb.classList.toggle('on', rb === b);
    fishGrid.toggleAttribute('hidden', cat !== 'fish');
    upGrid.toggleAttribute('hidden', cat === 'fish');
    refresh();
  });

  fishGrid.addEventListener('click', e => {
    if (e.target.closest('[data-autoegg]')) {
      Game.autoEggOn = Game.autoEggOn ? 0 : 1;
      saveGame();
      refresh();
      return;
    }
    const uk = e.target.closest('[data-key]');
    if (uk) {
      const u = UPS.find(x => x.key === uk.dataset.key);
      if (u && u.buy()) refresh();
      return;
    }
    if (e.target.closest('[data-egg]') && buyEgg()) refresh();
  });

  upGrid.addEventListener('click', e => {
    const el = e.target.closest('[data-key]');
    if (!el) return;
    const u = UPS.find(x => x.key === el.dataset.key);
    if (u && u.buy()) refresh();
  });

  document.getElementById('hud').addEventListener('mouseover', e => {
    const ct = e.target.closest('[data-cat]');
    if (ct) {
      uptip.textContent = ct.dataset.cat;
      const r = ct.getBoundingClientRect();
      uptip.style.right = 'auto';
      uptip.style.top = (r.top + 4) + 'px';
      uptip.style.left = (r.right + 12) + 'px';
      uptip.classList.add('cap');
      uptip.removeAttribute('hidden');
      return;
    }
    const ub = e.target.closest('[data-key]');
    const eb = e.target.closest('[data-egg]');
    if (!ub && !eb) return;
    uptip.classList.remove('cap', 'eggtip');
    if (ub) {
      const u = UPS.find(x => x.key === ub.dataset.key);
      uptip.innerHTML = (u.icon ? u.name + '<br>' : '') + u.desc + '<br>' + u.cur();
    } else if (living() >= FIRSTF_CAP) {
      uptip.textContent = 'Max ' + FIRSTF_CAP + ' fish';
    } else {
      uptip.classList.add('eggtip');
      const tiers = TIER_FISH.map((arr, i) => ({ t: i + 1, c: tierChance(i + 1), arr })).filter(x => x.c > 0);
      const block = x =>
        `<div class="ei-tier" style="color:rgb(${TIER_TINT[x.t - 1]})">Tier ${x.t}<span class="ei-pct">${fmtPct(x.c)}</span></div>` +
        x.arr.map(s => `<div class="ei-row">${thumb(s)}<span>${Game.seen[s] ? SPECIES[s].name : '???'}</span></div>`).join('');
      const cols = tiers.length > 3 ? [tiers.slice(0, 3), tiers.slice(3)] : [tiers];
      uptip.innerHTML = cols.map(c => `<div class="ei-col">${c.map(block).join('')}</div>`).join('');
    }
    const r = (ub || eb).getBoundingClientRect();
    uptip.style.right = 'auto';
    uptip.style.top = r.top + 'px';
    uptip.style.left = (r.right + 14) + 'px';
    uptip.removeAttribute('hidden');
  });
  document.getElementById('hud').addEventListener('mouseout', e => {
    if (e.target.closest('[data-key], [data-egg], [data-cat], [data-info]')) uptip.setAttribute('hidden', '');
  });

  return { refresh, tick };
})();
