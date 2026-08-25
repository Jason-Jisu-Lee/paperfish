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
    if (b.dataset.paper) {
      Game.paper += +b.dataset.paper;
      Game.paperEarned += +b.dataset.paper;
      if (Paper.shopOpen) Paper.render();
    }
    if (b.dataset.act === 'shop' && Game.started && !Paper.shopOpen) {
      Game.shop = 1;
      Paper.resume();
    }
    if (b.dataset.act === 'devmode') {
      Game.devMode = !Game.devMode;
      b.classList.toggle('on', Game.devMode);
      b.textContent = Game.devMode ? 'on' : 'off';
      if (Game.devMode) Tut.abort();
      if (Paper.shopOpen) Paper.render();
    }
    if (b.dataset.act === 'reset') resetGame();
  });
})();
