const Tut = (() => {
  const box = document.getElementById('tut');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-ok');
  const steps = [
    'fish passively generate income. click and hold the fish!',
    'clicking the fish also generates gold!'
  ];
  let active = false, timer = 0, pending = false;

  const place = () => {
    const f = Game.fish.find(x => !x.egg) || Game.fish[0];
    const w = 280, h = 96, m = 12;
    if (!f || f.x === undefined) {
      box.style.left = Math.round((innerWidth - w) / 2) + 'px';
      box.style.top = Math.round(innerHeight * 0.3) + 'px';
      return;
    }
    const fr = SPECIES[f.s].len * 0.65;
    let left = f.x + fr + 16;
    if (left + w > innerWidth - m) left = f.x - fr - 16 - w;
    box.style.left = Math.max(m, Math.min(left, innerWidth - w - m)) + 'px';
    box.style.top = Math.max(m, Math.min(f.y - h / 2, innerHeight - h - m)) + 'px';
  };

  const show = i => {
    if (i >= steps.length) return;
    txt.textContent = steps[i];
    place();
    box.removeAttribute('hidden');
    active = true;
  };

  btn.addEventListener('click', () => {
    box.setAttribute('hidden', '');
    active = false;
    Game.tut = (Game.tut || 0) + 1;
    saveGame();
    if (Game.tut === 1) {
      pending = true;
      timer = 5;
    }
  });

  const tick = mdt => {
    if (pending && !active && mdt > 0) {
      timer -= mdt;
      if (timer <= 0) {
        pending = false;
        show(1);
      }
    }
  };

  const start = () => {
    const t = Game.tut || 0;
    if (t === 0) show(0);
    else if (t === 1) {
      pending = true;
      timer = 5;
    }
  };

  return { tick, start, get active() { return active; } };
})();
