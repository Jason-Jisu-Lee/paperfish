const Tut = (() => {
  const box = document.getElementById('tut');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-ok');
  const steps = [
    'fish passively generate income. click and hold the fish!',
    'clicking the fish also generates gold!'
  ];
  let active = false, timer = 0, pending = false;

  const show = i => {
    if (i >= steps.length) return;
    txt.textContent = steps[i];
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
