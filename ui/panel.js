const Panel = (() => {
  const fmt = fmtG;
  const goldNum = document.getElementById('gold-num');
  const goldRate = document.getElementById('gold-rate');
  const goldSrc = document.getElementById('goldsrc');
  const upGrid = document.getElementById('up-grid');
  const fishGrid = document.getElementById('fish-grid');
  const viewUp = document.getElementById('view-up');
  const viewFish = document.getElementById('view-fish');
  const tabUp = document.getElementById('tab-up');
  const tabFish = document.getElementById('tab-fish');
  const uptip = document.getElementById('uptip');

  const UPS = [
    {
      key: 'stream', name: 'firstF Income', cat: 'income',
      cost: () => streamCost(), lvl: () => Game.stream, buy: () => buyStream(),
      neverBought: () => Game.stream === 0,
      desc: '+1 gold / 5s',
      cur: () => 'Current: +' + Game.stream + ' / 5s'
    },
    {
      key: 'kelp', name: 'Kelp', cat: 'food',
      cost: () => KELP_COST, lvl: () => Game.plants, buy: () => buyKelp(),
      neverBought: () => (Game.kelpBought || 0) === 0,
      desc: 'satisfies hunger for 1 minute',
      cur: () => 'Current: × ' + Game.plants + ' floating'
    },
    {
      key: 'mating', name: 'Spawning', cat: 'life',
      cost: () => matingCost(), lvl: () => Game.mating, buy: () => buyMating(),
      neverBought: () => Game.mating === 0,
      desc: '+5% chance to spawn each 2 min',
      cur: () => 'Current: ' + Game.mating * 5 + '%'
    },
    {
      key: 'maturity', name: 'Growth', cat: 'life',
      cost: () => maturityCost(), lvl: () => Game.maturity, buy: () => buyMaturity(),
      maxed: () => Game.maturity >= 24,
      neverBought: () => Game.maturity === 0,
      desc: 'matures 5s sooner',
      cur: () => 'Current: -' + Game.maturity * 5 + 's'
    },
    {
      key: 'longevity', name: 'Longevity', cat: 'life',
      cost: () => longevityCost(), lvl: () => Game.longevity, buy: () => buyLongevity(),
      neverBought: () => Game.longevity === 0,
      desc: '+30s firstF life',
      cur: () => 'Current: +' + Game.longevity * 30 + 's'
    }
  ];

  let cat = 'income';

  const thumb = (s, sil) => {
    const sp = SPECIES[s];
    let inner = sp.paths.map(d => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `<span class="thumb${sil ? ' sil' : ''}"><svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg></span>`;
  };

  const count = s => Game.fish.reduce((n, f) => n + (f.s === s && !f.egg && f.dying === undefined ? 1 : 0), 0);

  const capped = s => s === 0 && Game.fish.filter(f => f.s === 0 && f.dying === undefined).length >= FIRSTF_CAP;

  const refresh = () => {
    upGrid.innerHTML = UPS.filter(u => u.cat === cat).map(u => `
      <button class="ubtn" data-key="${u.key}">
        ${u.neverBought() ? '<span class="ubtn-seal"></span>' : ''}
        <span class="ubtn-lvl">× ${u.lvl()}</span>
        <span class="ubtn-name">${u.name}</span>
        <span class="ubtn-cost">${u.maxed && u.maxed() ? 'max' : fmt(u.cost()) + ' g'}</span>
      </button>`).join('');

    let h = '';
    for (let s = 0; s < Game.unlocked; s++) {
      const sp = SPECIES[s];
      h += `<button class="ubtn" data-buy="${s}">
        <span class="ubtn-lvl">× ${count(s)}</span>
        <span class="ubtn-icon full">${thumb(s)}</span>
        <span class="ubtn-cost">${fmt(sp.cost)} g</span>
      </button>`;
    }
    if (Game.unlocked < SPECIES.length) {
      const s = Game.unlocked;
      h += `<button class="ubtn" data-unlock>
        <span class="ubtn-icon">${thumb(s, true)}</span>
        <span class="ubtn-cost">${fmt(SPECIES[s].cost)} g</span>
      </button>`;
      if (s + 1 < SPECIES.length) {
        h += `<button class="ubtn lock">
          <span class="ubtn-lock"><svg viewBox="0 0 24 24"><rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5 V8 a3.5 3.5 0 0 1 7 0 V10.5"/></svg></span>
        </button>`;
      }
    }
    fishGrid.innerHTML = h;
    tick();
  };

  const srcBuild = () => {
    const groups = new Map();
    for (const f of Game.fish) {
      if (f.egg || f.dying !== undefined) continue;
      const g = groups.get(f.s) || { n: 0, sum: 0 };
      g.n += 1;
      g.sum += speciesGpm(f.s, f.age);
      groups.set(f.s, g);
    }
    let h = '';
    for (const [s, g] of groups) {
      h += `<div class="gs-row">${thumb(s)}<span class="gs-n">× ${g.n}</span><span class="gs-amt">+${fmt(g.sum)} / min</span></div>`;
    }
    goldSrc.innerHTML = h || '<div class="gs-row"><span class="gs-n">no fish earning</span></div>';
  };

  goldRate.addEventListener('mouseenter', () => {
    srcBuild();
    goldSrc.removeAttribute('hidden');
  });
  goldRate.addEventListener('mouseleave', () => goldSrc.setAttribute('hidden', ''));

  const tick = () => {
    goldNum.textContent = fmt(Game.gold);
    goldRate.textContent = '+' + fmt(ratePerMin()) + ' / min';
    for (const el of upGrid.querySelectorAll('[data-key]')) {
      const u = UPS.find(x => x.key === el.dataset.key);
      el.classList.toggle('off', Game.gold < u.cost() || !!(u.maxed && u.maxed()));
    }
    for (const el of fishGrid.querySelectorAll('[data-buy]'))
      el.classList.toggle('off', Game.gold < SPECIES[+el.dataset.buy].cost || capped(+el.dataset.buy));
    const un = fishGrid.querySelector('[data-unlock]');
    if (un) un.classList.toggle('off', Game.gold < SPECIES[Game.unlocked].cost);
    if (!goldSrc.hidden) srcBuild();
  };

  document.getElementById('hud').addEventListener('click', e => {
    const ct = e.target.closest('[data-cat]');
    if (ct) {
      cat = ct.dataset.cat;
      for (const el of document.querySelectorAll('[data-cat]')) el.classList.toggle('on', el === ct);
      refresh();
      return;
    }
    const ub = e.target.closest('[data-key]');
    if (ub) {
      const u = UPS.find(x => x.key === ub.dataset.key);
      if (u.buy()) refresh();
      return;
    }
    const buy = e.target.closest('[data-buy]');
    if (buy && buyFish(+buy.dataset.buy)) refresh();
    if (e.target.closest('[data-unlock]') && unlockNext()) refresh();
  });

  document.getElementById('hud').addEventListener('mouseover', e => {
    const ub = e.target.closest('[data-key]');
    const bf = e.target.closest('[data-buy]');
    const un = e.target.closest('[data-unlock]');
    if (!ub && !bf && !un) return;
    if (ub) {
      const u = UPS.find(x => x.key === ub.dataset.key);
      uptip.innerHTML = u.desc + '<br>' + u.cur();
    } else if (bf) {
      uptip.textContent = capped(+bf.dataset.buy) ? 'Max ' + FIRSTF_CAP + ' firstF' : 'Buy ' + SPECIES[+bf.dataset.buy].name + ' Egg';
    } else {
      uptip.textContent = 'Buy ' + SPECIES[Game.unlocked].name + ' Egg';
    }
    const r = (ub || bf || un).getBoundingClientRect();
    uptip.style.right = 'auto';
    uptip.style.top = r.top + 'px';
    uptip.style.left = (r.right + 14) + 'px';
    uptip.removeAttribute('hidden');
  });
  document.getElementById('hud').addEventListener('mouseout', e => {
    if (e.target.closest('[data-key], [data-buy], [data-unlock]')) uptip.setAttribute('hidden', '');
  });

  const setTab = fish => {
    viewUp.toggleAttribute('hidden', fish);
    viewFish.toggleAttribute('hidden', !fish);
    tabUp.classList.toggle('on', !fish);
    tabFish.classList.toggle('on', fish);
  };
  tabUp.addEventListener('click', () => setTab(false));
  tabFish.addEventListener('click', () => setTab(true));

  return { refresh, tick };
})();
