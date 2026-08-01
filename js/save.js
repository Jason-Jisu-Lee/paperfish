const SAVE = {
  KEY: 'fishtank1',
  timer: 0,

  save() {
    if (STATE.mode !== 'play') return;
    const data = {
      d: STATE.depth,
      lin: STATE.lineage,
      cap: TANK.capacity,
      fed: GATE.fed,
      fedList: GATE.fedList,
      idx: [...STATE.index],
      rel: TANK.released,
      fish: TANK.fishes.filter(f => !f.dead && f.state !== 'leave').map(f => ({ s: f.sp, sc: Math.round(f.scale * 100) / 100 }))
    };
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch (e) {}
  },

  load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) {}
    if (!data || !data.fish) return false;
    STATE.depth = data.d || 1;
    STATE.lineage = data.lin || 0;
    STATE.index = new Set(data.idx || []);
    TANK.capacity = data.cap || 20;
    TANK.released = data.rel || {};
    GATE.fed = data.fed || 0;
    GATE.fedList = data.fedList || [];
    const W = innerWidth, H = innerHeight;
    for (const rec of data.fish) {
      if (!SP[rec.s]) continue;
      const f = new Fish(rec.s, rnd(80, W - 80), rnd(100, H - 180), false);
      f.scale = rec.sc || 1;
      TANK.fishes.push(f);
    }
    return true;
  },

  reset() {
    try { localStorage.removeItem(this.KEY); } catch (e) {}
    location.reload();
  },

  update(dt) {
    this.timer += dt;
    if (this.timer > 6) { this.timer = 0; this.save(); }
  }
};
addEventListener('beforeunload', () => SAVE.save());
