const Music = (() => {
  const el = new Audio('audio/original/Equatorial Complex.mp3');
  el.loop = true;
  el.preload = 'auto';
  let ctx = null, master = null, gain = null, mode = 'off', fadeId = 0;

  const apply = () => {
    if (!ctx) return;
    const on = mode === 'shop';
    if (on) el.play().catch(() => {});
    gain.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.35);
    const id = ++fadeId;
    setTimeout(() => {
      if (id === fadeId && mode !== 'shop') el.pause();
    }, 1400);
  };

  const stilled = () => typeof Pause !== 'undefined' && Pause.paused;
  const live = () => (!window.paperfish || paperfish.sound) && !stilled();
  const sync = () => {
    if (ctx) master.gain.setTargetAtTime(live() ? 1 : 0, ctx.currentTime, 0.3);
  };
  document.addEventListener('pausechange', sync);

  const arm = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.value = 0;
    master.gain.setTargetAtTime(live() ? 1 : 0, ctx.currentTime, 1.1);
    gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain);
    gain.connect(master);
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

  return { front: () => set('off'), game: () => set('off'), shop: () => set('shop'), sync };
})();
