(() => {
  const store = 'paperfish.settings';
  const state = { sound: true, disp: 'win' };
  try {
    const saved = JSON.parse(localStorage.getItem(store));
    if (saved && typeof saved.sound === 'boolean') state.sound = saved.sound;
    if (saved && ['win', 'less', 'full'].includes(saved.disp)) state.disp = saved.disp;
  } catch (e) {}

  const modal = document.getElementById('setmodal');
  const menuRow = document.getElementById('set-menu-row');
  const slash = document.getElementById('music-slash');
  const fslash = document.getElementById('fmusic-slash');
  const glyphExpand = document.getElementById('glyph-expand');
  const glyphContract = document.getElementById('glyph-contract');
  const glyphPause = document.getElementById('glyph-pause');
  const glyphPlay = document.getElementById('glyph-play');
  const setSound = document.getElementById('set-sound');
  const setDisplay = document.getElementById('set-display');

  const save = () => {
    try { localStorage.setItem(store, JSON.stringify({ sound: state.sound, disp: state.disp })); } catch (e) {}
  };

  const render = () => {
    slash.toggleAttribute('hidden', state.sound);
    fslash.toggleAttribute('hidden', state.sound);
    setSound.classList.toggle('on', state.sound);
    const full = !!document.fullscreenElement;
    glyphExpand.toggleAttribute('hidden', full);
    glyphContract.toggleAttribute('hidden', !full);
    const mode = full ? (state.disp === 'win' ? 'full' : state.disp) : 'win';
    for (const b of setDisplay.children) b.classList.toggle('on', b.dataset.d === mode);
    glyphPause.toggleAttribute('hidden', Pause.paused);
    glyphPlay.toggleAttribute('hidden', !Pause.paused);
  };

  const toggleSound = () => { state.sound = !state.sound; save(); render(); Music.sync(); };
  const toggleScreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  const burnBtn = document.getElementById('burn');
  burnBtn.addEventListener('click', () => {
    if (doBurn()) burnBtn.setAttribute('hidden', '');
  });
  document.getElementById('music').addEventListener('click', toggleSound);
  document.getElementById('front-music').addEventListener('click', toggleSound);
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
    state.disp = d;
    save();
    if (d === 'win') {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } else if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    render();
  });
  document.addEventListener('fullscreenchange', render);
  document.addEventListener('pausechange', render);

  window.paperfish = state;
  render();
})();
