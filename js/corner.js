(() => {
  const store = 'paperfish.settings';
  const state = { sound: true };
  try {
    const saved = JSON.parse(localStorage.getItem(store));
    if (saved && typeof saved.sound === 'boolean') state.sound = saved.sound;
  } catch (e) {}

  const panel = document.getElementById('panel');
  const slash = document.getElementById('music-slash');
  const glyphExpand = document.getElementById('glyph-expand');
  const glyphContract = document.getElementById('glyph-contract');
  const glyphPause = document.getElementById('glyph-pause');
  const glyphPlay = document.getElementById('glyph-play');
  const soundValue = document.querySelector('#row-sound .value');
  const screenValue = document.querySelector('#row-screen .value');

  const save = () => {
    try { localStorage.setItem(store, JSON.stringify({ sound: state.sound })); } catch (e) {}
  };

  const render = () => {
    slash.toggleAttribute('hidden', state.sound);
    soundValue.textContent = state.sound ? 'on' : 'off';
    const full = !!document.fullscreenElement;
    glyphExpand.toggleAttribute('hidden', full);
    glyphContract.toggleAttribute('hidden', !full);
    screenValue.textContent = full ? 'full' : 'window';
    glyphPause.toggleAttribute('hidden', Pause.paused);
    glyphPlay.toggleAttribute('hidden', !Pause.paused);
  };

  const toggleSound = () => { state.sound = !state.sound; save(); render(); };
  const toggleScreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  document.getElementById('music').addEventListener('click', toggleSound);
  document.getElementById('screen').addEventListener('click', toggleScreen);
  document.getElementById('pause').addEventListener('click', () => Pause.set(!Pause.paused));
  document.getElementById('settings').addEventListener('click', e => {
    e.stopPropagation();
    panel.toggleAttribute('hidden');
  });
  document.getElementById('row-sound').addEventListener('click', toggleSound);
  document.getElementById('row-screen').addEventListener('click', toggleScreen);
  document.getElementById('row-front').addEventListener('click', () => {
    panel.setAttribute('hidden', '');
    goFront();
  });
  armReset(document.getElementById('row-reset'), () => resetGame());
  document.addEventListener('fullscreenchange', render);
  document.addEventListener('pausechange', render);
  document.addEventListener('click', e => {
    if (!panel.hasAttribute('hidden') && !panel.contains(e.target)) panel.setAttribute('hidden', '');
  });

  window.paperfish = state;
  render();
})();
