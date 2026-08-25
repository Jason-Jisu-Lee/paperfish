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
    const hw = SPECIES[f.s].len * 0.62 + 10, hh = SPECIES[f.s].len * 0.38 + 10;
    return { x: f.x - hw, y: f.y - hh, w: hw * 2, h: hh * 2 };
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
    btn.textContent = label;
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
    ['fish', 'Paperfish do not live long.', 'Oh no'],
    ['fc-lbar', 'But they still have a soul and will grant Soul Points once their life bar reaches 0', 'I see'],
    ['fc-hun', 'This is their hunger bar.<br>Starving fish do not grant soul.<br>Click any empty space to drop food', 'Sure']
  ];
  let istep = -1;
  let iside = 'right', ifish = null;

  const iShow = () => {
    const [id, text, label] = I_STEPS[istep];
    const fr = fishRect(ifish);
    if (id === 'fish') {
      const side = iside === 'right' ? 'left' : 'right';
      const avail = side === 'right' ? innerWidth - (fr.x + fr.w) : fr.x;
      const gap = Math.min(HGAP, Math.max(56, avail - 354));
      show(fr, null, text, label, side, side === 'right' ? fr.x + fr.w + gap : fr.x - gap);
      return;
    }
    const card = document.getElementById('fishcard').getBoundingClientRect();
    const avail = iside === 'right' ? innerWidth - card.right : card.left;
    const gap = Math.min(HGAP, Math.max(56, avail - 354));
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

  const P_STEPS = [
    ['up', 'You can find universal Research here.'],
    ['tier', 'Tier Research improves every fish in that tier.'],
    ['index', 'Each fish is unique. You can view them here.']
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
