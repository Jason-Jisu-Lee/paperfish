const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  const dim = document.getElementById('tut-dim');
  const line = document.getElementById('tut-line');
  const frame = document.getElementById('tut-frame');
  const frame2 = document.getElementById('tut-frame2');
  let active = false;

  const PAD = 6, GAP = 48, HGAP = 130;

  const rectOf = el => {
    const r = el.getBoundingClientRect();
    return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
  };

  const fishRect = f => {
    const a = SPECIES[f.s].len * 0.62 * 0.72 + 3;
    return { x: f.x - a, y: f.y - a, w: a * 2, h: a * 2 };
  };

  const place = (el, r) => Object.assign(el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });

  const show = (a, b, text, label, side, edgeX) => {
    const fx = b ? b.x : -999, fy = b ? b.y : -999, fw = b ? b.w : 0, fh = b ? b.h : 0;
    dim.style.maskPosition = dim.style.webkitMaskPosition = `${a.x}px ${a.y}px, ${fx}px ${fy}px, 0 0`;
    dim.style.maskSize = dim.style.webkitMaskSize = `${a.w}px ${a.h}px, ${fw}px ${fh}px, 100% 100%`;
    place(frame, a);
    frame.removeAttribute('hidden');
    if (b) {
      place(frame2, b);
      frame2.removeAttribute('hidden');
    } else frame2.setAttribute('hidden', '');
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    if (side === 'up') {
      Object.assign(line.style, { left: cx - 1 + 'px', top: a.y - GAP + 'px', width: '2px', height: GAP + 'px' });
      box.style.left = cx + 'px';
      box.style.top = a.y - GAP + 'px';
    } else if (side === 'right') {
      Object.assign(line.style, { left: a.x + a.w + 'px', top: cy - 1 + 'px', width: edgeX - a.x - a.w + 'px', height: '2px' });
      box.style.left = edgeX + 'px';
      box.style.top = Math.min(Math.max(cy, 100), innerHeight - 100) + 'px';
    } else {
      Object.assign(line.style, { left: edgeX + 'px', top: cy - 1 + 'px', width: a.x - edgeX + 'px', height: '2px' });
      box.style.left = edgeX + 'px';
      box.style.top = Math.min(Math.max(cy, 100), innerHeight - 100) + 'px';
    }
    box.classList.remove('up', 'right', 'left');
    box.classList.add(side);
    txt.innerHTML = text;
    btn.textContent = label || '';
    btn.toggleAttribute('hidden', !label);
    dim.removeAttribute('hidden');
    line.removeAttribute('hidden');
    box.removeAttribute('hidden');
  };

  const hide = () => {
    active = false;
    for (const n of [box, dim, line, frame, frame2]) n.setAttribute('hidden', '');
    saveGame();
  };

  const I_STEPS = [
    ['fish', '<b>Paperfish</b> do not live long.', 'Oh no'],
    ['fc-lbar', 'But they will grant <b>Paper</b> points once their <b>Life Bar</b> reaches 0.', 'I see'],
    ['fc-hun', 'This is their <b>Hunger Bar</b>.<br><b>Starving</b> paperfish do not grant <b>Paper</b> at the time of death.<br><b>Click</b> any empty space to drop food.', 'Sure']
  ];
  let istep = -1;
  let iside = 'right', ifish = null;

  const iShow = () => {
    const [id, text, label] = I_STEPS[istep];
    const fr = fishRect(ifish);
    if (id === 'fish') {
      const side = iside === 'right' ? 'left' : 'right';
      const avail = side === 'right' ? innerWidth - (fr.x + fr.w) : fr.x;
      const gap = Math.min(HGAP, Math.max(56, avail - 374));
      show(fr, null, text, label, side, side === 'right' ? fr.x + fr.w + gap : fr.x - gap);
      return;
    }
    const card = document.getElementById('fishcard').getBoundingClientRect();
    const avail = iside === 'right' ? innerWidth - card.right : card.left;
    const gap = Math.min(HGAP, Math.max(56, avail - 374));
    show(rectOf(document.getElementById(id)), fr, text, label, iside, iside === 'right' ? card.right + gap : card.left - gap);
  };

  const iEnd = () => {
    istep = -1;
    Game.tuts.introTut = 1;
    hide();
  };

  const intro = f => {
    if (Game.devMode || Game.tuts.introTut || istep >= 0) return;
    active = true;
    ifish = f;
    iside = f.x > innerWidth / 2 ? 'left' : 'right';
    Detail.select(f, iside);
    Detail.tick();
    istep = 0;
    iShow();
  };

  const E_STEPS = [
    ["Every <b>Paperfish</b> specie is born from an <b>Egg</b>.<br>It's where <b>Paper</b> is folded into a life.", 'Interesting'],
    ['Try creating an <b>Egg</b>!', null]
  ];
  let estep = -1, eggWait = -1;

  const eShow = () => {
    const [text, label] = E_STEPS[estep];
    const r = rectOf(document.querySelector('#fish-grid [data-egg]'));
    const gap = Math.min(HGAP, Math.max(56, innerWidth - (r.x + r.w) - 374));
    show(r, null, text, label, 'right', r.x + r.w + gap);
  };

  const eEnd = () => {
    estep = -1;
    eggWait = 5;
    hide();
  };

  const eggLocked = () => !Game.devMode && !Game.tuts.eggTut && estep < 0;

  const eggClicked = () => {
    if (estep < 0) return;
    estep = -1;
    Game.tuts.eggTut = 1;
    hide();
  };

  const tick = mdt => {
    if (active || Game.devMode || Game.tuts.eggTut || !Game.tuts.introTut) return;
    if (eggWait < 0) { eggWait = 5; return; }
    if (!mdt) return;
    if (eggWait > 0) { eggWait = Math.max(eggWait - mdt, 0); return; }
    if (Game.gold < eggCost()) return;
    const el = document.querySelector('#fish-grid [data-egg]');
    if (!el || !el.getBoundingClientRect().width) return;
    active = true;
    estep = 0;
    eShow();
  };

  document.addEventListener('click', e => {
    if (estep < 0) return;
    if (e.target.closest('#tut-next') || (estep === 1 && e.target.closest('[data-egg]'))) return;
    e.stopPropagation();
    e.preventDefault();
  }, true);

  const P_STEPS = [
    ['up', 'You can find universal <b>Research</b> here.'],
    ['tier', '<b>Tier Research</b> improves every paperfish in that tier.'],
    ['index', 'Each paperfish is <b>Unique</b>. You can view them here.']
  ];
  let pstep = -1;

  const pShow = () => {
    const [key, text] = P_STEPS[pstep];
    show(rectOf(document.querySelector(`#p-tabs [data-tab="${key}"]`)), null, text, pstep === P_STEPS.length - 1 ? 'Got it' : 'Next', 'up');
  };

  const pEnd = () => {
    pstep = -1;
    Game.tuts.pIntro = 1;
    hide();
  };

  const prestige = () => {
    if (Game.devMode || Game.tuts.pIntro || pstep >= 0) return;
    active = true;
    pstep = 0;
    pShow();
  };

  btn.addEventListener('click', () => {
    if (estep >= 0) {
      estep = 1;
      eShow();
      return;
    }
    if (istep >= 0) {
      istep += 1;
      if (istep < I_STEPS.length) iShow();
      else iEnd();
      return;
    }
    if (pstep >= 0) {
      pstep += 1;
      if (pstep < P_STEPS.length) pShow();
      else pEnd();
    }
  });

  const abort = () => {
    if (!active) return;
    if (istep >= 0) return iEnd();
    if (pstep >= 0) return pEnd();
    if (estep >= 0) return eEnd();
  };

  window.addEventListener('resize', () => {
    if (istep >= 0 && ifish) {
      iside = ifish.x > innerWidth / 2 ? 'left' : 'right';
      Detail.select(ifish, iside);
      Detail.tick();
      iShow();
    } else if (pstep >= 0) pShow();
    else if (estep >= 0) eShow();
  });

  return { intro, abort, prestige, tick, eggLocked, eggClicked, get active() { return active; } };
})();
