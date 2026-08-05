const TANK = {
  fishes: [],

  total() { return this.fishes.length; },
  count(sp) { let n = 0; for (const f of this.fishes) if (f.sp === sp) n++; return n; },

  addFish(sp, x, y, quiet) {
    const f = new Fish(sp, x, y);
    this.fishes.push(f);
    if (!quiet) FX.ripple(x, y, 4, 20, 0.7, 0.25);
    return f;
  },

  update(dt, t, W, H) {
    const iv = tickInterval(STATE.up);
    for (const f of this.fishes) {
      f.update(dt, t, W, H);
      f.payT -= dt;
      if (f.payT <= 0) {
        f.payT += iv;
        const s = SP[f.sp];
        const amt = payoutOf(s, STATE.up);
        STATE.gold += amt;
        FX.addFloat(f.x, f.y - s.size * s.asp * 0.5 - 8, '+' + fmt(amt));
      }
    }
  }
};
