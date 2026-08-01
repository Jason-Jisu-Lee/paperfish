const STATE = { mode: 'loading', depth: 1, index: new Set(), lineage: 0 };

const MAIN = {
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,
  fading: null,
  asc: null,

  init() {
    this.canvas = document.getElementById('c');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', e => this.click(e));
    ASSETS.load().then(() => {
      UI.init();
      if (!SAVE.load()) this.newGame();
      FX.initSnow(DEPTHS[STATE.depth].snow);
      STATE.mode = 'play';
    });
    requestAnimationFrame(now => this.frame(now));
  },

  resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    this.W = innerWidth; this.H = innerHeight;
    this.canvas.width = this.W * d;
    this.canvas.height = this.H * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    if (STATE.mode === 'play') FX.initSnow(DEPTHS[STATE.depth].snow);
  },

  newGame() {
    STATE.index.add('bass');
    for (let i = 0; i < 3; i++)
      TANK.addFish('bass', rnd(this.W * 0.35, this.W * 0.65), rnd(this.H * 0.35, this.H * 0.6), false);
  },

  click(e) {
    if (this.fading) return;
    if (STATE.mode === 'ascent') { this.asc.speed = 3.2; return; }
    if (STATE.mode !== 'play' || UI.anyOpen()) return;
    const mx = e.clientX, my = e.clientY;
    if (GATE.hit(mx, my, this.W, this.H)) { GATE.click(this.W, this.H); return; }
    if (WILD.hit(mx, my)) { WILD.tryLure(this.W, this.H); return; }
    let best = null, bd = 1e9;
    for (const f of TANK.fishes) {
      if (f.dead) continue;
      const d = Math.hypot(f.x - mx, f.y - my);
      if (d < Math.max(16, SP[f.sp].size * 0.45) && d < bd) { best = f; bd = d; }
    }
    if (best) UI.fishTip(best, mx, my);
  },

  fade(dur, action) {
    this.fading = { t: 0, dur, action, fired: false };
  },

  descend(sel) {
    this.fade(2.4, () => {
      const old = STATE.depth;
      for (const sp of GATE.fedList) TANK.release(sp, 1, old);
      const keep = {};
      for (const k in sel) keep[k] = sel[k];
      const carried = [];
      for (const f of TANK.fishes) {
        if (f.dead) continue;
        if (keep[f.sp] > 0) { keep[f.sp]--; carried.push(f.sp); }
        else TANK.release(f.sp, 1, old);
      }
      TANK.fishes = [];
      TANK.eggs = [];
      TANK.rituals = {};
      TANK.breedT = {};
      STATE.depth++;
      STATE.lineage++;
      GATE.resetForDepth();
      for (const spId of carried)
        TANK.addFish(spId, rnd(this.W * 0.35, this.W * 0.65), rnd(this.H * 0.35, this.H * 0.6), false);
      FX.initSnow(DEPTHS[STATE.depth].snow);
      TRADER.active = null;
      TRADER.nextAt = TRADER.clock + 14;
      UI.hideOffer();
      UI.toast(DEPTHS[STATE.depth].label);
      SAVE.save();
    });
  },

  beginAscent() {
    for (const f of TANK.fishes) if (!f.dead) TANK.release(f.sp, 1, 5);
    for (const sp of GATE.fedList) TANK.release(sp, 1, 5);
    TANK.fishes = [];
    const bands = [];
    for (let d = 1; d <= 5; d++) {
      const drifters = [];
      const rel = TANK.released[d] || {};
      for (const spId in rel) {
        for (let i = 0; i < rel[spId] && drifters.length < 44; i++) {
          drifters.push({
            sp: spId,
            x: rnd(60, this.W - 60),
            y: rnd(120, this.H * 0.82),
            dir: Math.random() < 0.5 ? 1 : -1,
            speed: rnd(8, 16),
            phase: rnd(0, TAU)
          });
        }
      }
      bands.push({ d, drifters });
    }
    this.asc = { t: 0, speed: 1, hold: 0, bands };
    UI.hideOffer();
    UI.hideHud();
    try { localStorage.removeItem(SAVE.KEY); } catch (e) {}
    STATE.mode = 'ascent';
  },

  frame(now) {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.T = (this.T || 0) + dt;
    if (STATE.mode === 'play') {
      TANK.update(dt, this.T, this.W, this.H);
      TRADER.update(dt, this.W, this.H);
      WILD.update(dt, this.W, this.H);
      GATE.update(dt);
      FX.update(dt, this.T);
      SAVE.update(dt);
      UI.updateHud();
      this.render();
    } else if (STATE.mode === 'ascent') {
      this.asc.t += dt * this.asc.speed;
      FX.update(dt, this.T);
      this.renderAscent(dt);
    }
    if (this.fading) {
      const f = this.fading;
      f.t += dt;
      if (!f.fired && f.t >= f.dur / 2) { f.action(); f.fired = true; }
      const a = f.t < f.dur / 2 ? f.t / (f.dur / 2) : 1 - (f.t - f.dur / 2) / (f.dur / 2);
      this.ctx.fillStyle = 'rgba(0,0,0,' + clamp(a, 0, 1).toFixed(3) + ')';
      this.ctx.fillRect(0, 0, this.W, this.H);
      if (f.t >= f.dur) this.fading = null;
    }
    requestAnimationFrame(n => this.frame(n));
  },

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.W, this.H);
    FX.drawSnow(ctx);
    GATE.draw(ctx, this.T, this.W, this.H);
    TRADER.draw(ctx, this.T);
    WILD.draw(ctx, this.T);
    TANK.drawEggs(ctx);
    const sorted = TANK.fishes.slice().sort((a, b) => SP[a.sp].size - SP[b.sp].size);
    for (const f of sorted) f.draw(ctx, this.T);
    FX.drawRipples(ctx);
  },

  renderAscent(dt) {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.W, this.H);
    FX.drawSnow(ctx);
    const bh = this.H * 0.92;
    const total = 4 * bh;
    const k = clamp(this.asc.t / 38, 0, 1);
    const camY = (1 - eio(k)) * total;
    ctx.textAlign = 'center';
    for (const band of this.asc.bands) {
      const y0 = (band.d - 1) * bh - camY;
      if (y0 > this.H || y0 + bh < -100) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(DEPTHS[band.d].label, this.W / 2, y0 + 46);
      for (const dr of band.drifters) {
        dr.x += dr.dir * dr.speed * dt;
        if (dr.x < 50) dr.dir = 1;
        if (dr.x > this.W - 50) dr.dir = -1;
        const s = SP[dr.sp];
        const img = ASSETS.ras[dr.sp];
        if (!img) continue;
        const w = s.size * 0.8, h = w * s.asp;
        const sy = y0 + dr.y + Math.sin(this.T * 1.4 + dr.phase) * 3;
        ctx.save();
        ctx.translate(dr.x, sy);
        if (dr.dir > 0) ctx.scale(-1, 1);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    if (k >= 1) {
      this.asc.hold += dt;
      if (this.asc.hold > 1.6 && STATE.mode === 'ascent') {
        STATE.mode = 'end';
        UI.showEnd(STATE.index.size);
      }
    }
  }
};

window.FT = { STATE, TANK, TRADER, WILD, GATE, SAVE, MAIN };
MAIN.init();
