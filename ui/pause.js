const Pause = (() => {
  const veil = document.getElementById('veil');
  let paused = false;

  const set = v => {
    if (paused === v) return;
    if (v && !Game.started) return;
    paused = v;
    veil.toggleAttribute('hidden', !v);
    if (v) saveGame();
    document.dispatchEvent(new Event('pausechange'));
  };

  veil.addEventListener('click', () => set(false));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) set(true);
  });

  const sveil = document.getElementById('smallveil');
  let sizePaused = false;
  const checkSize = () => {
    const small = innerWidth < 600 || innerHeight < 420;
    sveil.toggleAttribute('hidden', !small);
    if (small && !paused) {
      sizePaused = true;
      set(true);
    } else if (!small && sizePaused) {
      sizePaused = false;
      set(false);
    }
  };
  window.addEventListener('resize', checkSize);
  checkSize();

  return { get paused() { return paused; }, set };
})();
