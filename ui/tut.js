const Tut = (() => {
  const box = document.getElementById('tutbox');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-next');
  let active = false, step = 0, revealed = false;

  const hungry = f => {
    active = true;
    step = 1;
    txt.textContent = 'Fish is hungry. Hungry fish do not generate soul when deceased';
    btn.removeAttribute('hidden');
    box.classList.remove('side');
    box.style.left = Math.min(Math.max(f.x, 210), innerWidth - 210) + 'px';
    box.style.top = Math.max(f.y - SPECIES[f.s].len * 0.3 - 18, 156) + 'px';
    box.removeAttribute('hidden');
  };

  btn.addEventListener('click', () => {
    if (step !== 1) return;
    step = 2;
    revealed = true;
    const food = document.getElementById('rail-food');
    food.removeAttribute('hidden');
    food.classList.add('pulse');
    txt.textContent = 'Buy food for your fish';
    btn.setAttribute('hidden', '');
    const r = food.getBoundingClientRect();
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
    saveGame();
  };

  const abort = () => {
    if (!active) return;
    active = false;
    step = 0;
    revealed = false;
    document.getElementById('rail-food').classList.remove('pulse');
    box.setAttribute('hidden', '');
  };

  return { hungry, foodOpened, abort, get active() { return active; }, get revealed() { return revealed; } };
})();
