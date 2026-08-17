(() => {
  const dev = document.getElementById('dev');

  document.addEventListener('keydown', e => {
    if (e.key === '`') dev.toggleAttribute('hidden');
  });

  dev.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.speed) {
      Game.speed = +b.dataset.speed;
      for (const s of dev.querySelectorAll('[data-speed]')) s.classList.toggle('on', s === b);
    }
    if (b.dataset.gold) {
      Game.gold += +b.dataset.gold;
      Panel.tick();
    }
    if (b.dataset.act === 'hatch') {
      for (const f of Game.fish) if (f.egg) Stage.hatch(f);
      Panel.refresh();
      saveGame();
    }
    if (b.dataset.act === 'soul') Game.souls += 1;
    if (b.dataset.act === 'reveal') {
      Game.devReveal = !Game.devReveal;
      b.classList.toggle('on', Game.devReveal);
      if (Soul.shopOpen) Soul.render();
    }
    if (b.dataset.act === 'reset') resetGame();
  });
})();
