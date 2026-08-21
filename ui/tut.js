const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  const dim = document.getElementById('tut-dim');
  let active = false, step = 0;

  const spot = (x, y, r) => {
    dim.style.setProperty('--hx', Math.round(x) + 'px');
    dim.style.setProperty('--hy', Math.round(y) + 'px');
    dim.style.setProperty('--hr', Math.round(r) + 'px');
  };

  const pointAt = f => {
    spot(f.x, f.y, SPECIES[f.s].len * 0.9);
    dim.removeAttribute('hidden');
    btn.removeAttribute('hidden');
    box.classList.remove('side');
    box.style.left = Math.min(Math.max(f.x, 210), innerWidth - 210) + 'px';
    box.style.top = Math.max(f.y - SPECIES[f.s].len * 0.3 - 18, 156) + 'px';
    box.removeAttribute('hidden');
  };

  const hungry = f => {
    active = true;
    step = 1;
    txt.innerHTML = 'A fish is hungry<br>Click the water to drop food';
    btn.textContent = 'Got it';
    pointAt(f);
  };

  const P_STEPS = [
    ['up', 'You can find universal upgrades here.'],
    ['tier', 'Tier upgrades improve every fish in that tier.'],
    ['index', 'Each fish is unique. You can view them here.']
  ];
  let pstep = -1;

  const pShow = () => {
    const [key, text] = P_STEPS[pstep];
    const r = document.querySelector(`#p-tabs [data-tab="${key}"]`).getBoundingClientRect();
    spot(r.left + r.width / 2, r.top + r.height / 2, Math.max(r.width * 0.75, 54));
    txt.textContent = text;
    btn.textContent = pstep === P_STEPS.length - 1 ? 'Got it' : 'Next';
    box.classList.remove('side');
    box.style.left = (r.left + r.width / 2) + 'px';
    box.style.top = (r.top - 14) + 'px';
    dim.removeAttribute('hidden');
    btn.removeAttribute('hidden');
    box.removeAttribute('hidden');
  };

  const pEnd = () => {
    pstep = -1;
    active = false;
    Game.tuts.pIntro = 1;
    btn.textContent = 'Next';
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
    saveGame();
  };

  const prestige = () => {
    if (Game.tuts.pIntro || pstep >= 0) return;
    active = true;
    pstep = 0;
    pShow();
  };

  btn.addEventListener('click', () => {
    if (pstep >= 0) {
      pstep += 1;
      if (pstep < P_STEPS.length) pShow();
      else pEnd();
      return;
    }
    if (step !== 1) return;
    active = false;
    step = 0;
    Game.tuts.hungryTut = 1;
    btn.textContent = 'Next';
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
    saveGame();
  });

  const abort = () => {
    if (!active) return;
    if (pstep >= 0) return pEnd();
    active = false;
    step = 0;
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
  };

  return { hungry, abort, prestige, get active() { return active; } };
})();
