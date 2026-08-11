const Panel = (() => {
  const fmt = fmtG;
  const goldNum = document.getElementById('gold-num');
  const goldRate = document.getElementById('gold-rate');
  const goldSrc = document.getElementById('goldsrc');
  const upGrid = document.getElementById('up-grid');
  const shoalRows = document.getElementById('shoal-rows');
  const depthRows = document.getElementById('depth-rows');
  const viewUp = document.getElementById('view-up');
  const viewFish = document.getElementById('view-fish');
  const tabUp = document.getElementById('tab-up');
  const tabFish = document.getElementById('tab-fish');
  const uptip = document.getElementById('uptip');

  const UPS = [
    {
      key: 'stream', name: 'firstF Income',
      cost: () => streamCost(), lvl: () => Game.stream, buy: () => buyStream(),
      neverBought: () => Game.stream === 0,
      desc: '+1 gold / 5s',
      cur: () => 'Current: +' + Game.stream + ' / 5s'
    },
    {
      key: 'kelp', name: 'Kelp',
      cost: () => KELP_COST, lvl: () => Game.plants, buy: () => buyKelp(),
      neverBought: () => (Game.kelpBought || 0) === 0,
      desc: 'satisfies hunger for 1 minute',
      cur: () => 'Current: × ' + Game.plants + ' floating'
    },
    {
      key: 'mating', name: 'Spawning',
      cost: () => matingCost(), lvl: () => Game.mating, buy: () => buyMating(),
      neverBought: () => Game.mating === 0,
      desc: '+5% chance to spawn each 2 min',
      cur: () => 'Current: ' + Game.mating * 5 + '%'
    },
    {
      key: 'maturity', name: 'Growth',
      cost: () => maturityCost(), lvl: () => Game.maturity, buy: () => buyMaturity(),
      maxed: () => Game.maturity >= 24,
      neverBought: () => Game.maturity === 0,
      desc: 'matures 5s sooner',
      cur: () => 'Current: -' + Game.maturity * 5 + 's'
    }
  ];

  const thumb = (s, sil) => {
    const sp = SPECIES[s];
    let inner = sp.paths.map(d => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `<span class="thumb${sil ? ' sil' : ''}"><svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg></span>`;
  };

  const count = s => Game.fish.reduce((n, f) => n + (f.s === s && !f.egg && f.dying === undefined ? 1 : 0), 0);

  const refresh = () => {
    upGrid.innerHTML = UPS.map(u => `
      <button class="ubtn" data-key="${u.key}">
        ${u.neverBought() ? '<span class="ubtn-seal"></span>' : ''}
        <span class="ubtn-lvl">× ${u.lvl()}</span>
        <span class="ubtn-name">${u.name}</span>
        <span class="ubtn-cost">${u.maxed && u.maxed() ? 'max' : fmt(u.cost()) + ' g'}</span>
      </button>`).join('');

    let h = '';
    for (let s = 0; s < Game.unlocked; s++) {
      const sp = SPECIES[s];
      h += `<button class="row" data-buy="${s}">
        <span class="fname">${sp.name}</span><span class="fmult">× ${count(s)}</span>
        <span class="leader"></span><span class="value">${fmt(sp.cost)}</span></button>`;
    }
    shoalRows.innerHTML = h;

    let d = '';
    for (let s = 0; s < SPECIES.length; s++) {
      if (s < Game.unlocked) {
        d += `<div class="row known">${thumb(s)}<span class="fname">${SPECIES[s].name}</span></div>`;
      } else if (s === Game.unlocked) {
        d += `<button class="row" data-unlock>${thumb(s, true)}<span class="fname faded">?</span>
          <span class="leader"></span><span class="value">${fmt(SPECIES[s].unlock)}</span></button>`;
      } else {
        d += `<div class="row known"><span class="bar"></span><span class="leader"></span><span class="value">?</span></div>`;
      }
    }
    depthRows.innerHTML = d;
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
    for (const el of shoalRows.querySelectorAll('[data-buy]'))
      el.classList.toggle('dim', Game.gold < SPECIES[+el.dataset.buy].cost);
    const un = depthRows.querySelector('[data-unlock]');
    if (un) un.classList.toggle('dim', Game.gold < SPECIES[Game.unlocked].unlock);
    if (!goldSrc.hidden) srcBuild();
  };

  document.getElementById('hud').addEventListener('click', e => {
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
    const un = e.target.closest('[data-unlock]');
    if (!ub && !un) return;
    if (ub) {
      const u = UPS.find(x => x.key === ub.dataset.key);
      uptip.innerHTML = u.desc + '<br>' + u.cur();
    } else {
      uptip.textContent = 'unlock to buy';
    }
    const r = (ub || un).getBoundingClientRect();
    uptip.style.left = 'auto';
    uptip.style.top = r.top + 'px';
    uptip.style.right = (window.innerWidth - r.left + 14) + 'px';
    uptip.removeAttribute('hidden');
  });
  document.getElementById('hud').addEventListener('mouseout', e => {
    if (e.target.closest('[data-key], [data-unlock]')) uptip.setAttribute('hidden', '');
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
