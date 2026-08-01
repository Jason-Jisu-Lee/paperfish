const WILD = {
  active: null,
  nextAt: 12,
  clock: 0,

  update(dt, W, H) {
    this.clock += dt;
    if (!this.active && this.clock >= this.nextAt && STATE.mode === 'play' && TANK.total() < TANK.capacity) this.spawn(W, H);
    const w = this.active;
    if (!w) return;
    w.t += dt;
    if (w.state === 'cross') {
      w.x += w.vx * dt;
      w.y += Math.sin(w.t * 0.7 + w.phase) * 9 * dt;
      if ((w.vx > 0 && w.x > W + 130) || (w.vx < 0 && w.x < -130)) this.despawn();
    } else if (w.state === 'wait') {
      const o = w.t * 0.5;
      w.x += (w.wx + Math.cos(o) * 32 - w.x) * Math.min(1, dt * 0.8);
      w.y += (w.wy + Math.sin(o) * 15 - w.y) * Math.min(1, dt * 0.8);
    } else if (w.state === 'join') {
      w.alpha = Math.min(1, w.alpha + dt * 0.9);
      if (w.alpha >= 1) {
        TANK.addFish(w.sp, w.x, w.y, false);
        this.despawn();
      }
    }
  },

  despawn() {
    this.active = null;
    this.nextAt = this.clock + rnd(22, 45);
  },

  spawn(W, H) {
    const lockedHere = poolFor(STATE.depth).filter(s => !STATE.index.has(s.id));
    const extras = poolUpTo(STATE.depth).filter(s => STATE.index.has(s.id) && TANK.count(s.id) < s.max);
    let sp = null;
    if (lockedHere.length && (Math.random() < 0.65 || !extras.length)) sp = pick(lockedHere).id;
    else if (extras.length) sp = pick(extras).id;
    else if (lockedHere.length) sp = lockedHere[0].id;
    else return;
    const toRight = Math.random() < 0.5;
    this.active = {
      sp, t: 0, phase: rnd(0, TAU),
      x: toRight ? -110 : W + 110,
      y: rnd(H * 0.18, H * 0.6),
      vx: (toRight ? 1 : -1) * rnd(14, 21),
      state: 'cross', alpha: 0.34
    };
  },

  hit(mx, my) {
    const w = this.active;
    if (!w || w.state !== 'cross') return false;
    return Math.hypot(mx - w.x, my - w.y) < Math.max(26, SP[w.sp].size * 0.6);
  },

  tryLure(W, H) {
    const w = this.active;
    if (!w || w.state !== 'cross') return;
    if (TANK.total() >= TANK.capacity) { UI.toast('no room'); return; }
    const pay = TRADER.findPay(SP[w.sp].value * 1.2, true);
    if (!pay) { UI.toast('nothing it wants'); return; }
    w.state = 'wait';
    w.wx = clamp(w.x, 110, W - 110);
    w.wy = clamp(w.y, 110, H - 190);
    TANK.takeFish(pay.sp, pay.n, () => ({ x: w.x, y: w.y }), f => TANK.release(f.sp, 1, STATE.depth), () => {
      if (this.active === w) w.state = 'join';
    });
  },

  draw(ctx, t) {
    const w = this.active;
    if (!w) return;
    const s = SP[w.sp];
    const img = ASSETS.ras[w.sp];
    if (!img) return;
    const wd = s.size, h = wd * s.asp;
    ctx.save();
    ctx.translate(w.x, w.y + Math.sin(t * 1.6 + w.phase) * 3);
    const movingRight = w.state === 'cross' ? w.vx > 0 : Math.sin(w.t * 0.5) < 0;
    if (!movingRight) ctx.scale(-1, 1);
    ctx.globalAlpha = w.state === 'join' ? w.alpha : 0.34;
    ctx.drawImage(img, -wd / 2, -h / 2, wd, h);
    ctx.restore();
    if (w.state === 'cross') {
      const pay = TRADER.findPay(s.value * 1.2, true);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#fff';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pay ? 'lure · ' + pay.n + ' ' + SP[pay.sp].name : 'beyond reach', w.x, w.y + h / 2 + 20);
    }
    ctx.globalAlpha = 1;
  }
};
