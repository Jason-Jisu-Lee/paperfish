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

  return { get paused() { return paused; }, set };
})();
