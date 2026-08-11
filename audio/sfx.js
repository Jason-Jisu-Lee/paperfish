const Sfx = (() => {
  let ac = null;

  const ctx = () => {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };

  const on = () => !window.paperfish || window.paperfish.sound;

  const note = (t, freq, dur, peak) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  };

  const objective = () => {
    if (!on() || !ctx()) return;
    const t = ac.currentTime;
    note(t, 659.25, 0.32, 0.09);
    note(t + 0.11, 987.77, 0.55, 0.08);
  };

  window.addEventListener('pointerdown', () => ctx(), { once: true });

  return { objective };
})();
