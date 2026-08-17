const Music = (() => {
  const SRC = {
    front: 'audio/Canon in D Major.mp3',
    game: 'audio/Canon in D for Two Harps.mp3',
    shop: 'audio/Equatorial Complex.mp3'
  };
  const LEVEL = { front: 0.8, game: 0.8, shop: 0.8, duck: 0.25 };
  const els = {};
  for (const name of Object.keys(SRC)) {
    const el = new Audio(SRC[name]);
    el.loop = true;
    el.preload = 'auto';
    els[name] = el;
  }
  const tracks = {};
  let ctx = null, master = null, mode = 'front', fadeId = 0;

  const track = name => {
    if (tracks[name]) return tracks[name];
    const el = els[name];
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 20000;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(filter);
    filter.connect(gain);
    gain.connect(master);
    tracks[name] = { el, filter, gain };
    return tracks[name];
  };

  const apply = () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    const want = {
      front: mode === 'front' ? LEVEL.front : 0,
      game: mode === 'game' ? LEVEL.game : mode === 'shop' ? LEVEL.duck : 0,
      shop: mode === 'shop' ? LEVEL.shop : 0
    };
    for (const name of Object.keys(SRC)) {
      const tr = track(name);
      if (want[name]) tr.el.play().catch(() => {});
      tr.gain.gain.setTargetAtTime(want[name], t, 0.35);
      tr.filter.frequency.setTargetAtTime(name === 'game' && mode === 'shop' ? 500 : 20000, t, 0.3);
    }
    const id = ++fadeId;
    setTimeout(() => {
      if (id !== fadeId) return;
      for (const name of Object.keys(tracks)) if (!want[name]) tracks[name].el.pause();
    }, 1400);
  };

  const sync = () => {
    if (master) master.gain.value = window.paperfish && !paperfish.sound ? 0 : 1;
  };

  const arm = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.connect(ctx.destination);
    sync();
    apply();
  };
  for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown']) {
    document.addEventListener(ev, arm, { once: true });
  }

  const set = m => {
    mode = m;
    if (!ctx) arm();
    if (ctx.state === 'suspended') ctx.resume();
    apply();
  };

  return { front: () => set('front'), game: () => set('game'), shop: () => set('shop'), sync };
})();
