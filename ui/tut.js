const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  const dim = document.getElementById('tut-dim');
  let active = false;

  const spot = (x, y, r) => {
    dim.style.setProperty('--hx', Math.round(x) + 'px');
    dim.style.setProperty('--hy', Math.round(y) + 'px');
    dim.style.setProperty('--hr', Math.round(r) + 'px');
  };

  const show = (el, text, label, k) => {
    const r = el.getBoundingClientRect();
    spot(r.left + r.width / 2, r.top + r.height / 2, Math.max(r.width * k, 54));
    txt.innerHTML = text;
    btn.textContent = label;
    box.classList.remove('side');
    box.style.left = Math.min(Math.max(r.left + r.width / 2, 170), innerWidth - 170) + 'px';
    box.style.top = (r.top - 14) + 'px';
    dim.removeAttribute('hidden');
    btn.removeAttribute('hidden');
    box.removeAttribute('hidden');
  };

  const hide = () => {
    active = false;
    btn.textContent = 'Next';
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
    saveGame();
  };

  const I_STEPS = [
    ['fc-lbar', 'A fish dies when its life timer reaches 0<br>Death gives Soul, spent on Research', 'Next'],
    ['fc-hun', 'Hungry fish do not release Soul<br>Click empty space to feed', 'Sure']
  ];
  let istep = -1;

  const iShow = () => {
    const [id, text, label] = I_STEPS[istep];
    show(document.getElementById(id), text, label, 0.62);
  };

  const iEnd = () => {
    istep = -1;
    Game.tuts.introTut = 1;
    hide();
  };

  const intro = f => {
    if (Game.devMode || Game.tuts.introTut || istep >= 0) return;
    active = true;
    Detail.select(f);
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
    show(document.querySelector(`#p-tabs [data-tab="${key}"]`), text, pstep === P_STEPS.length - 1 ? 'Got it' : 'Next', 0.75);
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

  return { intro, abort, prestige, get active() { return active; } };
})();
