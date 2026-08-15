const Panel = (() => {
  const fmt = fmtG;
  const goldNum = document.getElementById('gold-num');
  const goldRate = document.getElementById('gold-rate');
  const goldSrc = document.getElementById('goldsrc');
  const upGrid = document.getElementById('up-grid');
  const fishGrid = document.getElementById('fish-grid');
  const uptip = document.getElementById('uptip');

  const UPS = [
    { key: 'kelp', name: 'Kelp', cat: 'food', dev: true, desc: 'satisfies hunger for 1 minute' },
    { key: 'income', name: 'Income', cat: 'income', dev: true, desc: 'more gold per tick' },
    { key: 'tick', name: 'Tick Speed', cat: 'income', dev: true, desc: 'faster income ticks' },
    { key: 'spawning', name: 'Spawning', cat: 'life', dev: true, desc: 'chance to spawn eggs' },
    { key: 'growth', name: 'Growth', cat: 'life', dev: true, desc: 'matures sooner' },
    { key: 'longevity', name: 'Longevity', cat: 'life', dev: true, desc: 'longer life' }
  ];

  let cat = 'fish';

  const thumb = s => {
    const sp = SPECIES[s];
    let inner = sp.paths.map(d => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `<span class="thumb"><svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg></span>`;
  };

  const living = () => Game.fish.filter(f => f.dying === undefined).length;

  const refresh = () => {
    upGrid.innerHTML = UPS.filter(u => u.cat === cat).map(u => `
      <button class="ubtn devlock" data-key="${u.key}">
        <span class="devtag">dev</span>
        <span class="ubtn-name">${u.name}</span>
        <span class="ubtn-cost">—</span>
      </button>`).join('');

    fishGrid.innerHTML = `
      <button class="ubtn" data-egg>
        <span class="ubtn-lvl">× ${living()}</span>
        <span class="ubtn-icon full">${thumb(0)}</span>
        <span class="ubtn-cost">${fmt(eggCost())} G</span>
      </button>`;
    tick();
  };

  const tick = () => {
    goldNum.textContent = fmt(Game.gold);
    goldRate.textContent = '+' + fmt(ratePerMin()) + ' G / min';
    const eb = fishGrid.querySelector('[data-egg]');
    if (eb) eb.classList.toggle('off', Game.gold < eggCost() || living() >= FIRSTF_CAP);
  };

  const srcBuild = () => {
    let n = 0, sum = 0;
    for (const f of Game.fish) {
      if (f.egg || f.dying !== undefined) continue;
      n += 1;
      sum += speciesGpm(f.s, f.age);
    }
    goldSrc.innerHTML = n
      ? `<div class="gs-row">${thumb(0)}<span class="gs-n">× ${n}</span><span class="gs-amt">+${fmt(sum)} G / min</span></div>`
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
    if (e.target.closest('[data-egg]') && buyEgg()) refresh();
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
    uptip.classList.remove('cap');
    if (ub) {
      const u = UPS.find(x => x.key === ub.dataset.key);
      uptip.innerHTML = u.desc + '<br>not yet available to players';
    } else {
      uptip.textContent = living() >= FIRSTF_CAP ? 'Max ' + FIRSTF_CAP + ' firstF' : 'Buy firstF Egg';
    }
    const r = (ub || eb).getBoundingClientRect();
    uptip.style.right = 'auto';
    uptip.style.top = r.top + 'px';
    uptip.style.left = (r.right + 14) + 'px';
    uptip.removeAttribute('hidden');
  });
  document.getElementById('hud').addEventListener('mouseout', e => {
    if (e.target.closest('[data-key], [data-egg], [data-cat]')) uptip.setAttribute('hidden', '');
  });

  return { refresh, tick };
})();
