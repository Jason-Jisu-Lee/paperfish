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
  const graph = document.getElementById('fc-graph');
  const GX0 = 48, GX1 = 292, GY0 = 136, GY1 = 28;
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
  };

  const placeCard = (x, y, f) => {
    const w = 496, h = 410, m = 14;
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
    if (hover) {
      if (hover === sel) return;
      releaseSel();
      sel = hover;
      if (!hover.egg) {
        Stage.hold(hover);
        buildGraph(hover);
      }
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
        r = 15;
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

  const py = (v, ymax) => GY0 - (v / ymax) * (GY0 - GY1);

  const buildGraph = f => {
    const phs = speciesPhases(f.s);
    const life = lifeOf(f.s);
    const y0 = phaseVal(f.s, phs[0]);
    const ymax = phaseVal(f.s, phs[phs.length - 1]);
    let pts = '';
    let t = 0;
    const vals = new Set();
    for (const p of phs) {
      const x0 = GX0 + (t / life) * (GX1 - GX0);
      t += p.dur;
      const x1 = GX0 + (t / life) * (GX1 - GX0);
      const yy = py(phaseVal(f.s, p), ymax);
      vals.add(phaseVal(f.s, p));
      pts += `${x0},${yy} ${x1},${yy} `;
    }
    if (t < life) pts += `${GX1},${py(ymax, ymax)} `;
    const aAt = adultAtOf(f.s);
    let evo = '';
    if (aAt !== undefined) {
      const ex = GX0 + (aAt / life) * (GX1 - GX0);
      evo =
        `<line class="g-evo" x1="${ex}" y1="${GY1}" x2="${ex}" y2="${GY0}"/>` +
        `<text class="g-t g-stage" x="${(GX0 + ex) / 2}" y="${GY1 - 6}" text-anchor="middle">baby</text>` +
        `<text class="g-t g-stage" x="${(ex + GX1) / 2}" y="${GY1 - 6}" text-anchor="middle">adult</text>`;
    }
    let grid = '', ylab = '';
    for (const v of vals) {
      const yy = py(v, ymax);
      grid += `<line class="g-grid" x1="${GX0}" y1="${yy}" x2="${GX1}" y2="${yy}"/>`;
      ylab += `<text class="g-t" x="${GX0 - 6}" y="${yy + 4}" text-anchor="end">${fmt(v)} G</text>`;
    }
    graph.innerHTML =
      grid +
      `<path class="g-axis" d="M${GX0} ${GY1 - 4} V${GY0} H${GX1}"/>` +
      evo +
      `<polyline class="g-line" fill="none" points="${pts}"/>` +
      ylab +
      `<line class="g-nguide" id="g-guide" x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY0}"/>` +
      `<circle class="g-now" id="g-dot" r="3.4" cx="${GX0}" cy="${py(y0, ymax)}"/>` +
      `<text class="g-t" id="g-xend" x="${GX1}" y="${GY0 + 15}" text-anchor="end">${life} min</text>` +
      `<g id="g-hover" hidden><line class="g-guide" id="g-hline"/><circle class="g-hdot" id="g-hdot" r="2.8"/><text class="g-t g-ht" id="g-htext" text-anchor="middle"/><text class="g-t g-ht" id="g-htime" text-anchor="middle"/></g>`;
  };

  graph.addEventListener('mousemove', e => {
    const hg = document.getElementById('g-hover');
    if (!sel || !hg) return;
    const r = graph.getBoundingClientRect();
    const vx = (e.clientX - r.left) / r.width * 300;
    const xend = document.getElementById('g-xend');
    if (vx < GX0 - 6 || vx > GX1 + 6) {
      hg.setAttribute('hidden', '');
      if (xend) xend.removeAttribute('hidden');
      return;
    }
    const life = lifeOf(sel.s);
    const phs = speciesPhases(sel.s);
    const ymax = phaseVal(sel.s, phs[phs.length - 1]);
    const u = Math.min(Math.max((vx - GX0) / (GX1 - GX0), 0), 1);
    let age = Math.min(u * life, life - 0.0001);
    let ax = GX0 + u * (GX1 - GX0);
    let t = 0;
    for (let i = 0; i < phs.length - 1; i++) {
      t += phs[i].dur;
      const bx = GX0 + (t / life) * (GX1 - GX0);
      if (Math.abs(vx - bx) <= 7) {
        ax = bx;
        age = Math.min(t + 0.0001, life - 0.0001);
        break;
      }
    }
    const v = speciesGpm(sel.s, age);
    const ay = py(v, ymax);
    const line = document.getElementById('g-hline');
    line.setAttribute('x1', ax); line.setAttribute('x2', ax);
    line.setAttribute('y1', GY0); line.setAttribute('y2', ay);
    const dot = document.getElementById('g-hdot');
    dot.setAttribute('cx', ax); dot.setAttribute('cy', ay);
    const p = phaseAt(sel.s, age);
    const txt = document.getElementById('g-htext');
    txt.setAttribute('x', Math.min(Math.max(ax, GX0 + 44), GX1 - 44));
    txt.setAttribute('y', ay + 17);
    txt.textContent = p.tick === 60 ? fmt(p.amt) + ' G / min' : fmt(p.amt) + ' G / ' + p.tick + ' sec';
    const tt = document.getElementById('g-htime');
    const dispAge = (ax - GX0) / (GX1 - GX0) * life;
    tt.setAttribute('x', Math.min(ax, GX1 - 14));
    tt.setAttribute('y', GY0 + 15);
    tt.textContent = ageFmt(Math.min(dispAge + 0.0001, life));
    if (xend) xend.toggleAttribute('hidden', ax > GX1 - 46);
    hg.removeAttribute('hidden');
  });
  graph.addEventListener('mouseleave', () => {
    const hg = document.getElementById('g-hover');
    if (hg) hg.setAttribute('hidden', '');
    const xend = document.getElementById('g-xend');
    if (xend) xend.removeAttribute('hidden');
  });

  const uptip = document.getElementById('uptip');
  card.addEventListener('mouseover', e => {
    const row = e.target.closest('[data-hint]');
    if (!row) return;
    uptip.textContent = 'soul granted on death';
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
        if (sp.adultAt !== undefined) {
          tipStage.textContent = hover.adult ? 'adult' : 'baby';
          tipStage.removeAttribute('hidden');
        } else {
          tipStage.setAttribute('hidden', '');
        }
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
        graph.style.display = 'none';
      }
      const sp = SPECIES[sel.s];
      elName.textContent = sp.name;
      const total = sp.hatch ?? 60;
      elHatch.textContent = Math.max(Math.ceil(total - (sel.t || 0)), 0) + ' / ' + total + ' sec';
      return;
    }
    if (sel) {
      const sp = SPECIES[sel.s];
      if (cardMode !== 'fish') {
        cardMode = 'fish';
        for (const r of fishRows) r.removeAttribute('hidden');
        hatchRow.setAttribute('hidden', '');
        graph.style.display = '';
        buildGraph(sel);
        Stage.hold(sel);
      }
      const life = lifeOf(sel.s);
      const phs = speciesPhases(sel.s);
      const age = Math.min(sel.age || 0, life - 0.0001);
      const gpm = speciesGpm(sel.s, age);
      const p = phaseAt(sel.s, age);
      elName.textContent = sp.name;
      elAge.textContent = ageFmt(Math.min(sel.age || 0, life));
      elFreq.textContent = p.tick === 60 ? fmt(p.amt) + ' G / min' : fmt(p.amt) + ' G / ' + p.tick + ' sec';
      elDeath.textContent = '+' + soulYield() + ' Soul';
      const ymax = phaseVal(sel.s, phs[phs.length - 1]);
      const ax = GX0 + (Math.min(sel.age || 0, life) / life) * (GX1 - GX0);
      const ay = py(gpm, ymax);
      const guide = document.getElementById('g-guide');
      const dot = document.getElementById('g-dot');
      if (guide) {
        guide.setAttribute('x1', ax);
        guide.setAttribute('x2', ax);
        guide.setAttribute('y2', ay);
      }
      if (dot) {
        dot.setAttribute('cx', ax);
        dot.setAttribute('cy', ay);
      }
    }
  };

  return { tick };
})();
