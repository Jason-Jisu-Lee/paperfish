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

  const eat = () => {
    if (!on() || !ctx()) return;
    const t = ac.currentTime;
    note(t, 246.94, 0.06, 0.05);
    note(t + 0.07, 196, 0.09, 0.04);
  };

  const evolve = () => {
    if (!on() || !ctx()) return;
    const t = ac.currentTime;
    note(t, 392, 0.1, 0.05);
    note(t + 0.08, 587.33, 0.14, 0.06);
    note(t + 0.18, 783.99, 0.4, 0.05);
  };

  window.addEventListener('pointerdown', () => ctx(), { once: true });

  return { objective, eat, evolve };
})();
