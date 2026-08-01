const TANK = {
  fishes: [],
  eggs: [],
  rituals: {},
  breedT: {},
  capacity: 20,
  released: {},

  total() { return this.fishes.filter(f => !f.dead && f.state !== 'leave').length; },
  count(sp) { return this.fishes.filter(f => !f.dead && f.state !== 'leave' && f.sp === sp).length; },
  adults(sp) { return this.fishes.filter(f => !f.dead && f.state === 'swim' && f.sp === sp && f.scale >= 0.95); },
  ownedSpecies() {
    const seen = [];
    for (const f of this.fishes) if (!f.dead && f.state !== 'leave' && !seen.includes(f.sp)) seen.push(f.sp);
    return seen.sort((a, b) => this.count(b) - this.count(a));
  },

  addFish(sp, x, y, juv) {
    const f = new Fish(sp, x, y, juv);
    this.fishes.push(f);
    FX.ripple(x, y, 4, 20, 0.7, 0.25);
    if (!STATE.index.has(sp)) {
      STATE.index.add(sp);
      UI.toast(SP[sp].name + ' joins the index');
    }
    return f;
  },

  takeFish(sp, n, targetFn, onEach, onDone) {
    const cands = this.fishes
      .filter(f => !f.dead && f.sp === sp && f.state !== 'leave')
      .sort((a, b) => a.scale - b.scale || (a.state === 'swim' ? -1 : 1));
    if (cands.length < n) return false;
    let left = n;
    for (let i = 0; i < n; i++) {
      const f = cands[i];
      if (f.state === 'pairto' || f.state === 'pairing') this.cancelRitual(sp);
      f.state = 'leave';
      f.leaveTarget = targetFn;
      f.onLeft = () => {
        FX.ripple(f.x, f.y, 3, 14, 0.5, 0.3);
        if (onEach) onEach(f);
        left--;
        if (left === 0 && onDone) onDone();
      };
    }
    return true;
  },

  keepsPair(sel) {
    for (const spId of this.ownedSpecies()) {
      if (this.count(spId) - (sel[spId] || 0) >= 2) return true;
    }
    return false;
  },

  cancelRitual(sp) {
    const r = this.rituals[sp];
    if (!r) return;
    for (const f of [r.a, r.b]) if (f && !f.dead && f.state !== 'leave') { f.state = 'swim'; f.pairPt = null; }
    delete this.rituals[sp];
    this.breedT[sp] = SP[sp].breed * 0.5;
  },

  update(dt, t, W, H) {
    if (this.fishes.length === 0 && this.eggs.length === 0 && STATE.mode === 'play') {
      this.strayT = (this.strayT || 0) + dt;
      if (this.strayT > 6) {
        this.strayT = 0;
        this.addFish('bass', W * 0.4, H * 0.45, false);
        this.addFish('bass', W * 0.6, H * 0.5, false);
        UI.toast('strays drift in');
      }
    } else this.strayT = 0;
    const mult = 1 + 0.15 * STATE.lineage;
    for (const spId of this.ownedSpecies()) {
      const s = SP[spId];
      const adults = this.adults(spId);
      const cnt = this.count(spId);
      const ritual = this.rituals[spId];
      if (!ritual && cnt >= 2 && cnt < s.max && this.total() < this.capacity && adults.length >= 2) {
        this.breedT[spId] = (this.breedT[spId] || 0) + dt * Math.floor(adults.length / 2) * mult;
        if (this.breedT[spId] >= s.breed) {
          const a = adults[0], b = adults[1];
          const pt = { x: clamp((a.x + b.x) / 2, 70, W - 70), y: clamp((a.y + b.y) / 2, 90, H - 160) };
          a.state = b.state = 'pairto';
          a.pairPt = b.pairPt = pt;
          this.rituals[spId] = { a, b, pt, t: 0 };
        }
      }
      if (ritual) {
        const { a, b } = ritual;
        if (a.dead || b.dead || a.state === 'leave' || b.state === 'leave') { this.cancelRitual(spId); continue; }
        const near = f => Math.hypot(f.x - ritual.pt.x, f.y - ritual.pt.y) < 26;
        if (a.state === 'pairto' && near(a)) a.state = 'pairing';
        if (b.state === 'pairto' && near(b)) b.state = 'pairing';
        if (a.state === 'pairing' && b.state === 'pairing') {
          ritual.t += dt;
          if (ritual.t >= 4) {
            this.eggs.push({ sp: spId, x: ritual.pt.x, y: ritual.pt.y, t: 0 });
            FX.ripple(ritual.pt.x, ritual.pt.y, 3, 16, 0.8, 0.3);
            a.state = b.state = 'swim';
            this.breedT[spId] = 0;
            delete this.rituals[spId];
          }
        }
      }
    }
    for (const e of this.eggs) {
      e.t += dt;
      e.y += 3.5 * dt;
      if (e.t >= 7 && this.total() < this.capacity && this.count(e.sp) < SP[e.sp].max) {
        e.hatched = true;
        this.addFish(e.sp, e.x, e.y, true);
      }
    }
    this.eggs = this.eggs.filter(e => !e.hatched);
    for (const f of this.fishes) f.update(dt, t, W, H);
    this.fishes = this.fishes.filter(f => !f.dead);
  },

  drawEggs(ctx) {
    for (const e of this.eggs) {
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(e.x, e.y, 5.5, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(e.x + 1.2, e.y + 1, 1.6, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  },

  release(sp, n, depth) {
    if (!this.released[depth]) this.released[depth] = {};
    this.released[depth][sp] = (this.released[depth][sp] || 0) + n;
  }
};
