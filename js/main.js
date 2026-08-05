const STATE = { mode: 'loading', gold: 0, up: { glow: 0, current: 0, rich: 0 } };

const MAIN = {
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,

  init() {
    this.canvas = document.getElementById('c');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', e => this.hover(e));
    ASSETS.load().then(() => {
      UI.init();
      if (!SAVE.load()) this.newGame();
      STATE.mode = 'play';
      UI.build();
    });
    requestAnimationFrame(now => this.frame(now));
  },

  resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    const side = document.getElementById('side');
    this.W = innerWidth - (side ? side.offsetWidth : 0);
    this.H = innerHeight;
    this.canvas.width = innerWidth * d;
    this.canvas.height = this.H * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    FX.initKelp(this.W, this.H);
  },

  newGame() {
    TANK.addFish('minnow', this.W * 0.5, this.H * 0.45, true);
  },

  fishAt(mx, my) {
    let best = null, bd = 1e9;
    for (const f of TANK.fishes) {
      const d = Math.hypot(f.x - mx, f.y - my);
      if (d < Math.max(16, SP[f.sp].size * 0.45) && d < bd) { best = f; bd = d; }
    }
    return best;
  },

  hover(e) {
    if (STATE.mode !== 'play' || e.clientX > this.W) { UI.hideHover(); return; }
    const f = this.fishAt(e.clientX, e.clientY);
    if (f) UI.fishHover(f, e.clientX, e.clientY);
    else UI.hideHover();
  },

  frame(now) {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.T = (this.T || 0) + dt;
    if (STATE.mode === 'play') {
      TANK.update(dt, this.T, this.W, this.H);
      FX.update(dt, this.T);
      SAVE.update(dt);
      UI.tick();
      this.render();
    }
    requestAnimationFrame(n => this.frame(n));
  },

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, innerWidth, this.H);
    FX.drawGiant(ctx);
    FX.drawKelp(ctx, this.T, this.H);
    const sorted = TANK.fishes.slice().sort((a, b) => SP[a.sp].size - SP[b.sp].size);
    for (const f of sorted) f.draw(ctx, this.T);
    FX.drawBubbles(ctx);
    FX.drawRipples(ctx);
    FX.drawFloats(ctx);
  }
};

window.FT = { STATE, TANK, SAVE, MAIN };
MAIN.init();
