const SAVE = {
  KEY: 'fishtank3',
  timer: 0,

  save() {
    if (this.disabled || STATE.mode !== 'play') return;
    const c = {};
    for (const s of SPECIES) {
      const n = TANK.count(s.id);
      if (n) c[s.id] = n;
    }
    const data = { g: Math.floor(STATE.gold), up: STATE.up, c };
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch (e) {}
  },

  load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) {}
    if (!data || !data.c) return false;
    STATE.gold = data.g || 0;
    if (data.up) for (const k in STATE.up) STATE.up[k] = data.up[k] || 0;
    let any = false;
    for (const id in data.c) {
      if (!SP[id]) continue;
      for (let i = 0; i < data.c[id]; i++) {
        TANK.addFish(id, rnd(MAIN.W * 0.15, MAIN.W * 0.85), rnd(MAIN.H * 0.2, MAIN.H * 0.75), true);
        any = true;
      }
    }
    return any;
  },

  reset() {
    this.disabled = true;
    try { localStorage.removeItem(this.KEY); } catch (e) {}
    location.reload();
  },

  update(dt) {
    this.timer += dt;
    if (this.timer > 6) { this.timer = 0; this.save(); }
  }
};
addEventListener('beforeunload', () => SAVE.save());
