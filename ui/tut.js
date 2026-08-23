const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  const dim = document.getElementById('tut-dim');
  const line = document.getElementById('tut-line');
  let active = false;

  const PAD = 6, GAP = 48, HGAP = 130;

  const show = (el, text, label, side, edge, gap) => {
    const r = el.getBoundingClientRect();
    const hx = r.left - PAD, hy = r.top - PAD, hw = r.width + PAD * 2, hh = r.height + PAD * 2;
    Object.assign(dim.style, { left: hx + 'px', top: hy + 'px', width: hw + 'px', height: hh + 'px' });
    const cx = hx + hw / 2, cy = hy + hh / 2;
    if (side === 'up') {
      Object.assign(line.style, { left: cx - 1 + 'px', top: hy - GAP + 'px', width: '2px', height: GAP + 'px' });
      box.style.left = cx + 'px';
      box.style.top = hy - GAP + 'px';
    } else if (side === 'right') {
      const bx = edge.right + (gap || HGAP);
      Object.assign(line.style, { left: hx + hw + 'px', top: cy - 1 + 'px', width: bx - hx - hw + 'px', height: '2px' });
      box.style.left = bx + 'px';
      box.style.top = Math.min(Math.max(cy, 100), innerHeight - 100) + 'px';
    } else {
      const bx = edge.left - (gap || HGAP);
      Object.assign(line.style, { left: bx + 'px', top: cy - 1 + 'px', width: hx - bx + 'px', height: '2px' });
      box.style.left = bx + 'px';
      box.style.top = Math.min(Math.max(cy, 100), innerHeight - 100) + 'px';
    }
    box.classList.remove('up', 'right', 'left');
    box.classList.add(side);
    txt.innerHTML = text;
    btn.textContent = label;
    dim.removeAttribute('hidden');
    line.removeAttribute('hidden');
    box.removeAttribute('hidden');
  };

  const hide = () => {
    active = false;
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
    line.setAttribute('hidden', '');
    saveGame();
  };

  const I_STEPS = [
    ['fc-lbar', 'Fish dies when the life timer reaches 0, and grants Soul which is used for Research', 'Next'],
    ['fc-hun', 'Fish gets Hungry, and then Starving as hunger bar drops.<br>Starving fish do not grant soul.<br>Click empty space to feed the fish', 'Sure']
  ];
  let istep = -1;

  let iside = 'right', ifish = null;

  const iShow = () => {
    const [id, text, label] = I_STEPS[istep];
    const card = document.getElementById('fishcard').getBoundingClientRect();
    const avail = iside === 'right' ? innerWidth - card.right : card.left;
    const gap = Math.min(HGAP, Math.max(56, avail - 354));
    show(document.getElementById(id), text, label, iside, card, gap);
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

  const P_STEPS = [
    ['up', 'You can find universal Research here.'],
    ['tier', 'Tier Research improves every fish in that tier.'],
    ['index', 'Each fish is unique. You can view them here.']
  ];
  let pstep = -1;

  const pShow = () => {
    const [key, text] = P_STEPS[pstep];
    show(document.querySelector(`#p-tabs [data-tab="${key}"]`), text, pstep === P_STEPS.length - 1 ? 'Got it' : 'Next', 'up');
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
  };

  window.addEventListener('resize', () => {
    if (istep >= 0 && ifish) {
      iside = ifish.x > innerWidth / 2 ? 'left' : 'right';
      Detail.select(ifish, iside);
      Detail.tick();
      iShow();
    } else if (pstep >= 0) pShow();
  });

  return { intro, abort, prestige, get active() { return active; } };
})();
