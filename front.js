(() => {
  const front = document.getElementById('front');
  const set = document.getElementById('front-set');
  const screenRow = document.getElementById('front-screen');
  const screenValue = screenRow.querySelector('.value');

  const replayHero = () => {
    for (const p of front.querySelectorAll('.hero path, .pool')) {
      p.style.animation = 'none';
      void p.getBoundingClientRect();
      p.style.animation = '';
    }
  };

  document.getElementById('m-play').addEventListener('click', () => {
    front.classList.add('gone');
    setTimeout(() => front.setAttribute('hidden', ''), 750);
    startGame();
  });

  document.getElementById('m-settings').addEventListener('click', () => {
    set.toggleAttribute('hidden');
  });

  document.getElementById('m-quit').addEventListener('click', () => {
    window.close();
  });

  screenRow.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  });

  document.addEventListener('fullscreenchange', () => {
    screenValue.textContent = document.fullscreenElement ? 'full' : 'window';
  });

  window.goFront = () => {
    if (!Game.started) return;
    saveGame();
    Pause.set(false);
    Game.started = false;
    document.getElementById('hud').setAttribute('hidden', '');
    document.getElementById('corner').setAttribute('hidden', '');
    document.getElementById('goldbox').setAttribute('hidden', '');
    front.removeAttribute('hidden');
    replayHero();
    requestAnimationFrame(() => front.classList.remove('gone'));
  };
})();
