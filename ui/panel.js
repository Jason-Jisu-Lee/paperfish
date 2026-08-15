const Panel = (() => {
  const fmt = fmtG;
  const goldNum = document.getElementById('gold-num');
  const goldRate = document.getElementById('gold-rate');
  const goldSrc = document.getElementById('goldsrc');
  const upGrid = document.getElementById('up-grid');
  const fishGrid = document.getElementById('fish-grid');
  const uptip = document.getElementById('uptip');
  const eiModal = document.getElementById('egginfo-modal');
  const eiBody = document.getElementById('ei-body');
  const railFood = document.getElementById('rail-food');

  const UPS = [
    {
      key: 'income', name: 'Income', cat: 'income',
      cost: incomeUpCost, lvl: () => Game.incomeUp, buy: buyIncomeUp,
      desc: '+1 G / 5s for every fish',
      cur: () => 'Current: ' + fmt(incomePer5s()) + ' G / 5s'
    },
    {
      key: 'life', name: 'Lifespan', cat: 'life',
      cost: lifeUpCost, lvl: () => Game.lifeUp, buy: buyLifeUp,
      desc: '+5s lifespan for every fish',
      cur: () => 'Current: ' + (10 + Game.lifeUp * 5) + 's'
    },
    {
      key: 'kelp', name: 'Kelp', cat: 'food',
      cost: () => KELP_COST, lvl: () => Game.plants, buy: buyKelp,
      desc: 'two bites, one bite satisfies hunger for 10s',
      cur: () => 'Current: × ' + Game.plants + ' floating'
    }
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
    railFood.toggleAttribute('hidden', !Game.tuts.hungryTut && !Tut.revealed);
    upGrid.innerHTML = UPS.filter(u => u.cat === cat).map(u => `
      <button class="ubtn" data-key="${u.key}">
        <span class="ubtn-lvl">× ${u.lvl()}</span>
        <span class="ubtn-name">${u.name}</span>
        <span class="ubtn-cost">${fmt(u.cost())} G</span>
      </button>`).join('');

    fishGrid.innerHTML = `
      <button class="ubtn" data-egg>
        <span class="ubtn-info" data-info>i</span>
        <span class="ubtn-icon eggicon"><svg viewBox="-24 -30 48 60"><path d="M0,-24 C13,-24 19,-9 19,3 C19,17 10,25 0,25 C-10,25 -19,17 -19,3 C-19,-9 -13,-24 0,-24"/></svg></span>
        <span class="ubtn-cost">${fmt(eggCost())} G</span>
      </button>`;
    tick();
  };

  const tick = () => {
    goldNum.textContent = fmt(Game.gold);
    goldRate.textContent = '+' + fmt(ratePerMin()) + ' G / min';
    const eb = fishGrid.querySelector('[data-egg]');
    if (eb) eb.classList.toggle('off', Game.gold < eggCost() || living() >= FIRSTF_CAP);
    for (const el of upGrid.querySelectorAll('[data-key]')) {
      const u = UPS.find(x => x.key === el.dataset.key);
      el.classList.toggle('off', Game.gold < u.cost());
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
    if (cat === 'food') Tut.foodOpened();
    refresh();
  });

  fishGrid.addEventListener('click', e => {
    if (e.target.closest('[data-info]')) {
      eiBody.innerHTML =
        `<div class="ei-tier">Tier 1</div>` +
        `<div class="ei-row">${thumb(0)}<span>${SPECIES[0].name}</span><span class="ei-pct">100%</span></div>`;
      eiModal.removeAttribute('hidden');
      return;
    }
    if (e.target.closest('[data-egg]') && buyEgg()) refresh();
  });

  document.getElementById('ei-x').addEventListener('click', () => eiModal.setAttribute('hidden', ''));
  eiModal.addEventListener('click', e => {
    if (e.target === eiModal) eiModal.setAttribute('hidden', '');
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
    uptip.classList.remove('cap');
    if (ub) {
      const u = UPS.find(x => x.key === ub.dataset.key);
      uptip.innerHTML = u.desc + '<br>' + u.cur();
    } else {
      uptip.textContent = living() >= FIRSTF_CAP ? 'Max ' + FIRSTF_CAP + ' fish' : 'Buy an egg';
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
