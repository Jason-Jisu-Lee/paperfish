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
  const elHatch = document.getElementById('fc-hatch');
  const elHun = document.getElementById('fc-hun');
  const elHFill = document.getElementById('fc-hfill');
  const ebar = document.getElementById('fc-ebar');
  const elEFill = document.getElementById('fc-efill');
  const fishRows = ['fc-lbar', 'fc-hun', 'fc-freq-row', 'fc-death-row'].map(id => document.getElementById(id));

  const EGGART = '<svg viewBox="-26 -32 52 64" class="eggart"><path d="M0,-24 C13,-24 19,-9 19,3 C19,17 10,25 0,25 C-10,25 -19,17 -19,3 C-19,-9 -13,-24 0,-24"/></svg>';
  const fishArt = s => {
    const sp = SPECIES[s];
    const st = sp.tint ? ` style="stroke:rgb(${sp.tint})"` : '';
    let inner = sp.paths.map(d => `<path d="${d}"${st}/>`).join('');
    if (sp.dots) inner += sp.dots.map(d => `<circle class="dot" cx="${d.cx}" cy="${d.cy}" r="${d.r}"${sp.tint ? ` style="fill:rgb(${sp.tint})"` : ''}/>`).join('');
    if (sp.mirror) inner = `<g transform="translate(${sp.vb[0]},0) scale(-1,1)">${inner}</g>`;
    return `<svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}">${inner}</svg>`;
  };
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
    if (!f.egg && (f.heldT || 0) < 15) Stage.escape(f, 1);
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
      if (!f.egg) Stage.hold(f);
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
      else if (!Pause.paused && !Soul.shopOpen && (Game.tuts.introTut || Game.devMode)) Stage.spawnPellet(e.clientX, e.clientY);
      close();
    }
  });

  document.getElementById('fc-x').addEventListener('click', () => { if (!Tut.active) close(); });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  const hitTest = () => {
    if (mx === null || !Game.started) return null;
    let best = null, bd = Infinity;
    for (const f of Game.fish) {
      if (f.dying !== undefined) continue;
      let r;
      if (f.egg) {
        r = 16;
      } else {
        if (f.birth < 1) continue;
        r = SPECIES[f.s].len * 0.6;
      }
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
    uptip.textContent = 'paper granted on death, none while starving';
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
    canvas.style.cursor = hover || oceanHover ? 'pointer' : '';
    if (hover) {
      const sp = SPECIES[hover.s];
      tipName.textContent = sp.name;
      if (hover.egg) {
        tipStage.textContent = 'egg';
        tipStage.removeAttribute('hidden');
        tipHun.setAttribute('hidden', '');
        tipLife.setAttribute('hidden', '');
        tip.style.top = (hover.y - 26) + 'px';
      } else {
        tipStage.textContent = hover.adult ? 'adult' : 'baby';
        tipStage.removeAttribute('hidden');
        tipHFill.style.width = Math.min(Math.max((hover.hunger ?? HUNGER_FULL) / HUNGER_FULL, 0), 1) * 100 + '%';
        tipHun.classList.toggle('low', hover.hstate >= 1);
        tipHun.removeAttribute('hidden');
        const lifeT = lifeOf();
        tipLFill.style.width = Math.max(1 - Math.min(hover.age || 0, lifeT) / lifeT, 0) * 100 + '%';
        tipLife.removeAttribute('hidden');
        tip.style.top = (hover.y - sp.len * 0.3 - 16) + 'px';
      }
      tip.style.left = hover.x + 'px';
      tip.removeAttribute('hidden');
    } else {
      tip.setAttribute('hidden', '');
    }
    if (sel && sel.egg) {
      if (cardMode !== 'egg') {
        cardMode = 'egg';
        for (const r of fishRows) r.setAttribute('hidden', '');
        hatchRow.removeAttribute('hidden');
        ebar.removeAttribute('hidden');
        elPic.innerHTML = EGGART;
        elTier.textContent = tierOf(sel.s);
        elName.textContent = 'Egg';
        elStage.textContent = 'Unhatched';
      }
      const total = hatchTime();
      const left = Math.max(Math.ceil(total - (sel.t || 0)), 0);
      elAge.textContent = left + 's';
      elEFill.style.width = Math.min((sel.t || 0) / total, 1) * 100 + '%';
      elHatch.textContent = left + ' sec';
      return;
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
      elFreq.textContent = fmt(fishIncome(sel.s, sel.adult)) + ' G / ' + TICK + 's';
      elDeath.textContent = sel.hstate >= 2 ? '0' : '+' + soulYieldOf(sel.s);
    }
  };

  return { tick, select };
})();
