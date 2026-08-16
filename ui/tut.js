const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  const dim = document.getElementById('tut-dim');
  let active = false, step = 0, revealed = false, mode = '';

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

  const intro = () => {
    const f = Game.fish.find(x => !x.egg && x.dying === undefined);
    if (!f || active || Soul.shopOpen) return;
    active = true;
    mode = 'intro';
    txt.textContent = 'Fish generate gold passively, and a soul on death';
    pointAt(f);
  };

  const hungry = f => {
    active = true;
    mode = 'hungry';
    step = 1;
    txt.textContent = 'Fish is hungry. Hungry fish do not generate soul when deceased';
    pointAt(f);
  };

  btn.addEventListener('click', () => {
    if (mode === 'intro') {
      active = false;
      mode = '';
      Game.tuts.introTut = 1;
      box.setAttribute('hidden', '');
      dim.setAttribute('hidden', '');
      saveGame();
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
    mode = '';
    Game.tuts.hungryTut = 1;
    document.getElementById('rail-food').classList.remove('pulse');
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
    saveGame();
  };

  const abort = () => {
    if (!active) return;
    active = false;
    step = 0;
    mode = '';
    revealed = false;
    document.getElementById('rail-food').classList.remove('pulse');
    box.setAttribute('hidden', '');
    dim.setAttribute('hidden', '');
  };

  return { intro, hungry, foodOpened, abort, get active() { return active; }, get revealed() { return revealed; } };
})();
