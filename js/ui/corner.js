(() => {
  const store = 'paperfish.settings';
  const state = { sound: true };
  try {
    const saved = JSON.parse(localStorage.getItem(store));
    if (saved && typeof saved.sound === 'boolean') state.sound = saved.sound;
  } catch (e) {}

  const modal = document.getElementById('setmodal');
  const menuRow = document.getElementById('set-menu-row');
  const slash = document.getElementById('music-slash');
  const glyphExpand = document.getElementById('glyph-expand');
  const glyphContract = document.getElementById('glyph-contract');
  const glyphPause = document.getElementById('glyph-pause');
  const glyphPlay = document.getElementById('glyph-play');
  const setSound = document.getElementById('set-sound');
  const setDisplay = document.getElementById('set-display');

  const save = () => {
    try { localStorage.setItem(store, JSON.stringify({ sound: state.sound })); } catch (e) {}
  };

  const render = () => {
    slash.toggleAttribute('hidden', state.sound);
    setSound.classList.toggle('on', state.sound);
    const full = !!document.fullscreenElement;
    glyphExpand.toggleAttribute('hidden', full);
    glyphContract.toggleAttribute('hidden', !full);
    for (const b of setDisplay.children) b.classList.toggle('on', (b.dataset.d === 'full') === full);
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
  document.getElementById('settings').addEventListener('click', () => {
    menuRow.removeAttribute('hidden');
    modal.removeAttribute('hidden');
  });
  document.getElementById('set-menu').addEventListener('click', () => {
    modal.setAttribute('hidden', '');
    goFront();
  });
  setSound.addEventListener('click', toggleSound);
  setDisplay.addEventListener('click', e => {
    const d = e.target.dataset.d;
    if (!d) return;
    if (d === 'full' && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else if (d === 'win' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', render);
  document.addEventListener('pausechange', render);

  window.paperfish = state;
  render();
})();
