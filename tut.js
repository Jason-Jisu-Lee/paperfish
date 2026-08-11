const Tut = (() => {
  const box = document.getElementById('tut');
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-ok');
  const TEXTS = {
    death: "fish gives gold on death\n(don't worry, he went to fish heaven)"
  };
  let active = false, pendingName = null;

  const placeAt = (x, y) => {
    const w = 300, h = 100, m = 12;
    box.style.left = Math.max(m, Math.min(x, innerWidth - w - m)) + 'px';
    box.style.top = Math.max(m, Math.min(y, innerHeight - h - m)) + 'px';
  };

  const placeAnchor = a => {
    const w = 300, h = 100;
    if (a && a.getBoundingClientRect) {
      const r = a.getBoundingClientRect();
      placeAt(r.left - w - 16, r.top + r.height / 2 - h / 2);
    } else if (a && a.x !== undefined) {
      const fr = 60;
      let left = a.x + fr;
      if (left + w > innerWidth - 12) left = a.x - fr - w;
      placeAt(left, a.y - h / 2);
    } else {
      placeAt((innerWidth - w) / 2, innerHeight * 0.3);
    }
  };

  const fire = (name, anchor) => {
    if (active || !TEXTS[name] || (Game.tuts && Game.tuts[name])) return;
    pendingName = name;
    txt.textContent = TEXTS[name];
    placeAnchor(anchor);
    box.removeAttribute('hidden');
    active = true;
  };

  btn.addEventListener('click', () => {
    box.setAttribute('hidden', '');
    active = false;
    if (pendingName) {
      if (!Game.tuts) Game.tuts = {};
      Game.tuts[pendingName] = 1;
      pendingName = null;
      saveGame();
    }
  });

  return { fire, get active() { return active; } };
})();
