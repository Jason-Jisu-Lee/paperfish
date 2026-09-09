const Detail = (() => {
  const canvas = document.getElementById('sea');
  const tip = document.getElementById('fishtip');
  const tipName = document.getElementById('fishtip-name');
  const tipStage = document.getElementById('fishtip-stage');
  const tipHun = document.getElementById('fishtip-hunger');
  const tipHFill = document.getElementById('fishtip-hfill');
  const tipLife = document.getElementById('fishtip-life');
  const tipLFill = document.getElementById('fishtip-lfill');
  const card = document.getElementById('fishcard');
  const elName = document.getElementById('fc-name');
  const elAge = document.getElementById('fc-age');
  const elStage = document.getElementById('fc-stage');
  const elTier = document.getElementById('fc-tier');
  const elPic = document.getElementById('fc-pic');
  const elFill = document.getElementById('fc-fill');
  const elFreq = document.getElementById('fc-freq');
  const elDeath = document.getElementById('fc-death');
  const hatchRow = document.getElementById('fc-hatch-row');
  const elHun = document.getElementById('fc-hun');
  const elHFill = document.getElementById('fc-hfill');
  const ebar = document.getElementById('fc-ebar');
  const fishRows = ['fc-lbar', 'fc-hun', 'fc-freq-row', 'fc-death-row'].map(id => document.getElementById(id));

  const fishArt = s => speciesSVG(s);
  let cardMode = null;
  let mx = null, my = null, hover = null, sel = null;

  const fmt = fmtG;
  const ageFmt = age => {
    const m = Math.floor(age);
    return m + ':' + String(Math.floor((age % 1) * 60)).padStart(2, '0');
  };

  const releaseSel = () => {
    if (!sel) return;
    const f = sel;
    Stage.release();
    Stage.escape(f, 1);
    sel = null;
    cardMode = null;
  };

  const close = () => {
    releaseSel();
    card.setAttribute('hidden', '');
    uptip.setAttribute('hidden', '');
  };

  const placeCard = (x, y, f, side) => {
    const w = 292, h = 340, m = 14;
    const fr = SPECIES[f.s].len * 0.65;
    let left = side === 'left' ? f.x - fr - 18 - w : f.x + fr + 18;
    if (!side && left + w > window.innerWidth - m) left = f.x - fr - 18 - w;
    if (left < m) left = Math.max(m, Math.min(x + 20, window.innerWidth - w - m));
    const top = Math.max(m, Math.min(y - h / 2, window.innerHeight - h - m));
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  };

  canvas.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  canvas.addEventListener('mouseleave', () => { mx = null; my = null; });

  const select = (f, side) => {
    if (sel !== f) {
      releaseSel();
      sel = f;
      Stage.hold(f);
    }
    placeCard(f.x, f.y, f, side);
    card.removeAttribute('hidden');
  };

  canvas.addEventListener('click', e => {
    if (Tut.active) return;
    if (hover) {
      if (hover === sel) return;
      select(hover);
    } else {
      if (Lantern.clickAt(e.clientX, e.clientY) || Ocean.clickAt(e.clientX, e.clientY)) Panel.tick();
      else if (!Pause.paused && !Paper.shopOpen && (Game.tuts.introTut || Game.devMode)) Stage.spawnPellet(e.clientX, e.clientY);
      close();
    }
  });

  document.getElementById('fc-x').addEventListener('click', () => { if (!Tut.active) close(); });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  const hitTest = () => {
    if (mx === null || !Game.started) return null;
    let best = null, bd = Infinity;
    for (const f of Game.fish) {
      if (f.dying !== undefined || f.birth < 1) continue;
      const r = SPECIES[f.s].len * 0.6;
      const dx = f.x - mx, dy = f.y - my;
      const d = dx * dx + dy * dy;
      if (d < r * r && d < bd) { bd = d; best = f; }
    }
    return best;
  };

  const uptip = document.getElementById('uptip');
  card.addEventListener('mouseover', e => {
    const row = e.target.closest('[data-hint]');
    if (!row) return;
    uptip.classList.remove('cap');
    uptip.textContent = 'essence granted while alive, none while starving';
    const r = row.getBoundingClientRect();
    uptip.style.right = 'auto';
    uptip.style.left = r.left + 'px';
    uptip.style.top = (r.bottom + 8) + 'px';
    uptip.removeAttribute('hidden');
  });
  card.addEventListener('mouseout', e => {
    if (e.target.closest('[data-hint]')) uptip.setAttribute('hidden', '');
  });

  const tick = () => {
    if (!Game.started) {
      tip.setAttribute('hidden', '');
      close();
      return;
    }
    if (sel && (Game.fish.indexOf(sel) < 0 || sel.dying !== undefined)) close();
    hover = hitTest();
    const oceanHover = mx !== null && (Ocean.hoverAt(mx, my) || Lantern.hoverAt(mx, my));
    if (hover) {
      const sp = SPECIES[hover.s];
      tipName.textContent = sp.name;
      const stages = sp.stages || ['Baby', 'Adult'];
      const si = hover.adult ? stages.length - 1 : 0;
      tipStage.innerHTML = stages.map((n, i) =>
        `<i class="pip${i < si ? ' on' : ''}${i === si ? ' now' : ''}"></i>`).join('') +
        `<b>${stages[si]}</b>`;
      tipStage.removeAttribute('hidden');
      tipHFill.style.width = Math.min(Math.max((hover.hunger ?? HUNGER_FULL) / HUNGER_FULL, 0), 1) * 100 + '%';
      tipHun.classList.toggle('low', hover.hstate >= 1);
      tipHun.removeAttribute('hidden');
      const lifeT = lifeOf();
      tipLFill.style.width = Math.max(1 - Math.min(hover.age || 0, lifeT) / lifeT, 0) * 100 + '%';
      tipLife.removeAttribute('hidden');
      tip.style.top = (hover.y - sp.len * 0.3 - 16) + 'px';
      tip.style.left = hover.x + 'px';
      tip.removeAttribute('hidden');
    } else {
      tip.setAttribute('hidden', '');
    }
    if (sel) {
      if (cardMode !== 'fish') {
        cardMode = 'fish';
        for (const r of fishRows) r.removeAttribute('hidden');
        hatchRow.setAttribute('hidden', '');
        ebar.setAttribute('hidden', '');
        elPic.innerHTML = fishArt(sel.s);
        elTier.textContent = tierOf(sel.s);
        elName.textContent = SPECIES[sel.s].name;
        Stage.hold(sel);
      }
      const life = lifeOf();
      const age = Math.min(sel.age || 0, life);
      elStage.textContent = sel.hstate === 2 ? 'Starving' : sel.hstate === 1 ? 'Hungry' : sel.adult ? 'Adult' : 'Baby';
      elAge.textContent = ageFmt(age);
      elFill.style.width = (1 - age / life) * 100 + '%';
      elHFill.style.width = Math.min(Math.max((sel.hunger ?? HUNGER_FULL) / HUNGER_FULL, 0), 1) * 100 + '%';
      elHun.classList.toggle('low', sel.hstate >= 1);
      elFreq.textContent = fmtG1(fishIncome(sel.s, sel.adult)) + ' G / ' + TICK + 's';
      elDeath.textContent = sel.hstate >= 2 ? '0' : '+' + paperYieldOf(sel.s);
    }
  };

  return { tick, select };
})();
