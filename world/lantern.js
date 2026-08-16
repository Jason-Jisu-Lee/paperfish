const Lantern = (() => {
  const el = document.getElementById('lantern');
  const TOTAL = 3, PAY = 3;

  const active = () =>
    Game.started && (Game.objs.buyegg || 0) >= 2 && (Game.lanternTaps || 0) < TOTAL;

  const sync = () => {
    if (!active()) {
      el.setAttribute('hidden', '');
      return;
    }
    const b = Stage.bounds;
    el.style.left = (b.l + (b.r - b.l) * 0.64) + 'px';
    el.style.top = (b.t + (b.b - b.t) * 0.26) + 'px';
    el.removeAttribute('hidden');
  };

  el.addEventListener('click', () => {
    if (!active() || Pause.paused || Tut.active || Soul.shopOpen) return;
    Game.lanternTaps += 1;
    Game.gold += PAY;
    const r = el.getBoundingClientRect();
    Stage.spawnPop(r.left + r.width / 2, r.top - 8, '+' + PAY + ' G');
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    Obj.event('lantern');
    if (Game.lanternTaps >= TOTAL) {
      el.classList.add('out');
      setTimeout(() => {
        el.setAttribute('hidden', '');
        el.classList.remove('out', 'bump');
      }, 900);
    }
    saveGame();
  });

  return { sync };
})();
