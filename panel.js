const Panel = (() => {
  const fmt = fmtG;
  const goldNum = document.getElementById('gold-num');
  const goldRate = document.getElementById('gold-rate');
  const shoalRows = document.getElementById('shoal-rows');
  const currentRows = document.getElementById('current-rows');
  const depthRows = document.getElementById('depth-rows');
  const viewShoal = document.getElementById('view-shoal');
  const viewDepths = document.getElementById('view-depths');
  const tabShoal = document.getElementById('tab-shoal');
  const tabDepths = document.getElementById('tab-depths');

  const thumb = (s, sil) => {
    const sp = SPECIES[s];
    let inner = sp.paths.map(d => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `<span class="thumb${sil ? ' sil' : ''}"><svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg></span>`;
  };

  const count = s => Game.fish.reduce((n, f) => n + (f.s === s ? 1 : 0), 0);

  const refresh = () => {
    let h = '';
    for (let s = 0; s < Game.unlocked; s++) {
      const sp = SPECIES[s];
      h += `<button class="row" data-buy="${s}">
        <span class="fname">${sp.name}</span><span class="fmult">× ${count(s)}</span>
        <span class="leader"></span><span class="value">${fmt(sp.cost)}</span></button>`;
    }
    shoalRows.innerHTML = h;

    currentRows.innerHTML = `
      <button class="row" data-up="stream">
        <span class="fname">firstF Income</span><span class="tag">+1 / 5s</span><span class="fmult">× ${Game.stream}</span>
        <span class="leader"></span><span class="value">${fmt(streamCost())}</span></button>
      <button class="row" data-up="kelp">
        <span class="fname">Gold Kelp</span><span class="tag">food</span><span class="fmult">× ${Game.plants}</span>
        <span class="leader"></span><span class="value">${fmt(KELP_COST)}</span></button>
      <button class="row" data-up="mating">
        <span class="fname">Spawning</span><span class="tag">+5%</span><span class="fmult">× ${Game.mating}</span>
        <span class="leader"></span><span class="value">${fmt(matingCost())}</span></button>
      <button class="row" data-up="maturity">
        <span class="fname">Growth</span><span class="tag">-5s</span><span class="fmult">× ${Game.maturity}</span>
        <span class="leader"></span><span class="value">${Game.maturity >= 24 ? 'max' : fmt(maturityCost())}</span></button>`;

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

  const tick = () => {
    goldNum.textContent = fmt(Game.gold);
    goldRate.textContent = '+' + fmt(ratePerMin()) + ' / min';
    for (const el of shoalRows.querySelectorAll('[data-buy]'))
      el.classList.toggle('dim', Game.gold < SPECIES[+el.dataset.buy].cost);
    const ups = currentRows.querySelectorAll('[data-up]');
    if (ups[0]) ups[0].classList.toggle('dim', Game.gold < streamCost());
    if (ups[1]) ups[1].classList.toggle('dim', Game.gold < KELP_COST);
    if (ups[2]) ups[2].classList.toggle('dim', Game.gold < matingCost());
    if (ups[3]) ups[3].classList.toggle('dim', Game.gold < maturityCost() || Game.maturity >= 24);
    const un = depthRows.querySelector('[data-unlock]');
    if (un) un.classList.toggle('dim', Game.gold < SPECIES[Game.unlocked].unlock);
  };

  document.getElementById('hud').addEventListener('click', e => {
    const buy = e.target.closest('[data-buy]');
    if (buy && buyFish(+buy.dataset.buy)) refresh();
    const up = e.target.closest('[data-up]');
    if (up && ({ stream: buyStream, kelp: buyKelp, mating: buyMating, maturity: buyMaturity })[up.dataset.up]()) refresh();
    if (e.target.closest('[data-unlock]') && unlockNext()) refresh();
  });

  const UP_DESC = {
    stream: () => 'firstF earns +1 gold per 5 seconds. stacks.',
    kelp: () => 'satisfies hunger for 1 minute',
    mating: () => 'spawn chance at birth +5%. now ' + Game.mating * 5 + '%.',
    maturity: () => 'matures 5 seconds sooner. now ' + Game.maturity * 5 + 's sooner.'
  };
  const uptip = document.getElementById('uptip');
  document.getElementById('hud').addEventListener('mouseover', e => {
    const row = e.target.closest('[data-up], [data-unlock]');
    if (!row) return;
    uptip.textContent = row.dataset.up ? UP_DESC[row.dataset.up]() : 'unlock to buy';
    const r = row.getBoundingClientRect();
    uptip.style.left = 'auto';
    uptip.style.top = r.top + 'px';
    uptip.style.right = (window.innerWidth - r.left + 14) + 'px';
    uptip.removeAttribute('hidden');
  });
  document.getElementById('hud').addEventListener('mouseout', e => {
    if (e.target.closest('[data-up], [data-unlock]')) uptip.setAttribute('hidden', '');
  });

  const setTab = depths => {
    viewShoal.toggleAttribute('hidden', depths);
    viewDepths.toggleAttribute('hidden', !depths);
    tabShoal.classList.toggle('on', !depths);
    tabDepths.classList.toggle('on', depths);
  };
  tabShoal.addEventListener('click', () => setTab(false));
  tabDepths.addEventListener('click', () => setTab(true));

  return { refresh, tick };
})();
