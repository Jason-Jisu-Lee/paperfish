const GATE = {
  fed: 0,
  fedList: [],
  pulse: 0,

  need() { return DEPTHS[STATE.depth].gate; },
  pos(W, H) { return { x: W / 2, y: H - 74 }; },
  ready() { return this.fed >= this.need(); },

  hit(mx, my, W, H) {
    const p = this.pos(W, H);
    return Math.hypot(mx - p.x, my - p.y) < 52;
  },

  click(W, H) {
    if (this.ready()) {
      if (STATE.depth === 5) { MAIN.beginAscent(); return; }
      UI.showCarryPanel();
    } else {
      UI.showGatePanel();
    }
  },

  feed(sel, W, H) {
    const p = this.pos(W, H);
    for (const spId in sel) {
      const n = sel[spId];
      if (n > 0) TANK.takeFish(spId, n, () => p, f => {
        this.fed++;
        this.fedList.push(f.sp);
        this.pulse = 1;
        if (this.ready()) UI.toast('the gate is full');
      }, null);
    }
  },

  update(dt) {
    this.pulse = Math.max(0, this.pulse - dt * 2);
  },

  draw(ctx, t, W, H) {
    const p = this.pos(W, H);
    const need = this.need();
    const rdy = this.ready();
    const base = rdy ? 0.5 + 0.25 * Math.sin(t * 1.6) : 0.22;
    ctx.strokeStyle = '#fff';
    ctx.globalAlpha = base + this.pulse * 0.35;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(p.x, p.y, 44, 0, TAU); ctx.stroke();
    if (!rdy && this.fed > 0) {
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(p.x, p.y, 44, -Math.PI / 2, -Math.PI / 2 + TAU * (this.fed / need)); ctx.stroke();
    }
    ctx.globalAlpha = rdy ? 0.75 : 0.4;
    ctx.fillStyle = '#fff';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rdy ? (STATE.depth === 5 ? 'the last gate' : 'descend') : this.fed + ' / ' + need, p.x, p.y + 4);
    const nShow = Math.min(this.fedList.length, 24);
    for (let i = 0; i < nShow; i++) {
      const a = t * 0.24 + i * (TAU / nShow);
      const rr = 62 + 16 * Math.sin(i * 2.7 + t * 0.4);
      const fx0 = p.x + Math.cos(a) * rr, fy0 = p.y + Math.sin(a) * rr * 0.42 + 8;
      const s = SP[this.fedList[i]];
      const img = ASSETS.ras[this.fedList[i]];
      if (!img) continue;
      const w = s.size * 0.32, h = w * s.asp;
      ctx.save();
      ctx.translate(fx0, fy0);
      if (Math.sin(a) > 0) ctx.scale(-1, 1);
      ctx.globalAlpha = 0.13;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  resetForDepth() {
    this.fed = 0;
    this.fedList = [];
  }
};
