const Detail = (() => {
  const canvas = document.getElementById('sea');
  const tip = document.getElementById('fishtip');
  const tipName = document.getElementById('fishtip-name');
  const tipStage = document.getElementById('fishtip-stage');
  const card = document.getElementById('fishcard');
  const elName = document.getElementById('fc-name');
  const elAge = document.getElementById('fc-age');
  const elFreq = document.getElementById('fc-freq');
  const elDeath = document.getElementById('fc-death');
  const hatchRow = document.getElementById('fc-hatch-row');
  const elHatch = document.getElementById('fc-hatch');
  const fishRows = ['fc-age-row', 'fc-freq-row', 'fc-death-row'].map(id => document.getElementById(id));
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

  const placeCard = (x, y, f) => {
    const w = 280, h = 240, m = 14;
    const fr = SPECIES[f.s].len * 0.65;
    let left = f.x + fr + 18;
    if (left + w > window.innerWidth - m) left = f.x - fr - 18 - w;
    if (left < m) left = Math.max(m, Math.min(x + 20, window.innerWidth - w - m));
    const top = Math.max(m, Math.min(y - h / 2, window.innerHeight - h - m));
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  };

  canvas.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  canvas.addEventListener('mouseleave', () => { mx = null; my = null; });

  canvas.addEventListener('click', e => {
    if (Tut.active) return;
    if (hover) {
      if (hover === sel) return;
      releaseSel();
      sel = hover;
      if (!hover.egg) Stage.hold(hover);
      placeCard(hover.x, hover.y, hover);
      card.removeAttribute('hidden');
    } else {
      if (Ocean.clickAt(e.clientX, e.clientY)) Panel.tick();
      close();
    }
  });

  document.getElementById('fc-x').addEventListener('click', close);

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  const hitTest = () => {
    if (mx === null || !Game.started) return null;
    let best = null, bd = Infinity;
    for (const f of Game.fish) {
      if (f.dying !== undefined) continue;
      let r;
      if (f.egg) {
        r = 24;
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
    uptip.textContent = 'soul granted on death, none while hungry';
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
    const oceanHover = mx !== null && Ocean.hoverAt(mx, my);
    canvas.style.cursor = hover || oceanHover ? 'pointer' : '';
    if (hover) {
      const sp = SPECIES[hover.s];
      tipName.textContent = sp.name;
      if (hover.egg) {
        tipStage.textContent = 'egg';
        tipStage.removeAttribute('hidden');
        tip.style.top = (hover.y - 26) + 'px';
      } else {
        tipStage.textContent = hover.adult ? 'adult' : 'baby';
        tipStage.removeAttribute('hidden');
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
      }
      elName.textContent = SPECIES[sel.s].name;
      const total = hatchTime();
      elHatch.textContent = Math.max(Math.ceil(total - (sel.t || 0)), 0) + ' / ' + total + ' sec';
      return;
    }
    if (sel) {
      if (cardMode !== 'fish') {
        cardMode = 'fish';
        for (const r of fishRows) r.removeAttribute('hidden');
        hatchRow.setAttribute('hidden', '');
        Stage.hold(sel);
      }
      const life = lifeOf();
      elName.textContent = SPECIES[sel.s].name;
      elAge.textContent = ageFmt(Math.min(sel.age || 0, life));
      elFreq.textContent = fmt(incomePer5s()) + ' G / ' + TICK + ' sec';
      elDeath.textContent = sel.hstate >= 1 ? 'none, hungry' : '+' + soulYield() + ' Soul';
    }
  };

  return { tick };
})();
