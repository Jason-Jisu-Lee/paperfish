const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  const dim = document.getElementById('tut-dim');
  let active = false, step = 0, revealed = false;

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
    txt.textContent = 'Fish is hungry. Hungry fish do not generate soul when deceased';
    pointAt(f);
  };

  const P_STEPS = [
    ['up', 'Permanent upgrades, kept through every dive.'],
    ['tier', 'Unlock new tiers of fish.'],
    ['index', 'Your collection of discovered fish.']
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
    step = 2;
    revealed = true;
    const food = document.getElementById('rail-food');
    food.removeAttribute('hidden');
    food.classList.add('pulse');
    txt.textContent = 'Buy food for your fish';
    btn.setAttribute('hidden', '');
    const r = food.getBoundingClientRect();
    spot(r.left + r.width / 2, r.top + r.height / 2, 40);
    box.classList.add('side');
    box.style.left = (r.right + 18) + 'px';
    box.style.top = (r.top + r.height / 2) + 'px';
  });

  const foodOpened = () => {
    if (step !== 2) return;
    active = false;
    step = 0;
    Game.tuts.hungryTut = 1;
    document.getElementById('rail-food').classList.remove('pulse');
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
    saveGame();
  };

  const abort = () => {
    if (!active) return;
    if (pstep >= 0) return pEnd();
    active = false;
    step = 0;
    revealed = false;
    document.getElementById('rail-food').classList.remove('pulse');
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
  };

  return { hungry, foodOpened, abort, prestige, get active() { return active; }, get revealed() { return revealed; } };
})();
