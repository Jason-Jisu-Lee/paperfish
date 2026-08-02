const TRADER = {
  active: null,
  nextAt: 22,
  clock: 0,

  update(dt, W, H) {
    this.clock += dt;
    if (!this.active && this.clock >= this.nextAt && STATE.mode === 'play') this.spawn(W, H);
    const tr = this.active;
    if (!tr) return;
    tr.x += tr.speed * dt;
    tr.bob += dt;
    if (!tr.shown && tr.x > W * 0.18) { tr.shown = true; if (tr.offer) UI.showOffer(tr.offer); }
    if (tr.shown && !tr.dealt && !tr.leaving) {
      tr.window -= dt;
      if (tr.window <= 0) this.pass();
    }
    if (tr.x > W + 300) {
      this.active = null;
      this.nextAt = this.clock + rnd(50, 85);
      UI.hideOffer();
    }
  },

  spawn(W, H) {
    const offer = this.genOffer();
    this.active = {
      x: -300, y: H * rnd(0.13, 0.2), speed: 27, bob: rnd(0, TAU),
      offer, shown: false, dealt: false, leaving: false, window: 26
    };
  },

  price(get) {
    return get.type === 'egg' ? SP[get.sp].value * 2.2 : 10 + 6 * STATE.depth + (TANK.capacity - 20) * 1.5;
  },

  findPay(targetValue, keepPair) {
    for (const spId of TANK.ownedSpecies()) {
      const n = Math.max(1, Math.round(targetValue / SP[spId].value));
      const cnt = TANK.count(spId);
      const spare = keepPair ? Math.max(0, cnt - 2) : (cnt > 2 ? cnt - 2 : cnt);
      if (n <= spare) return { sp: spId, n };
    }
    return null;
  },

  genOffer() {
    const lockedHere = poolFor(STATE.depth).filter(s => !STATE.index.has(s.id));
    const lockedAny = poolUpTo(STATE.depth).filter(s => !STATE.index.has(s.id));
    const locked = lockedHere.length ? lockedHere : lockedAny;
    const room = TANK.capacity - TANK.total();
    let eggGet = null;
    if (locked.length && room >= 2) {
      const sorted = locked.slice().sort((a, b) => a.value - b.value);
      eggGet = { type: 'egg', sp: sorted[Math.floor(Math.pow(Math.random(), 2) * sorted.length)].id };
    }
    const spaceGet = TANK.capacity < 30 ? { type: 'space', amount: 5 } : null;
    let order = [];
    if (eggGet && spaceGet) order = Math.random() < 0.78 ? [eggGet, spaceGet] : [spaceGet, eggGet];
    else if (eggGet) order = [eggGet];
    else if (spaceGet) order = [spaceGet];
    else if (locked.length) order = [{ type: 'egg', sp: locked[0].id }];
    else return null;
    for (const get of order) {
      const pay = this.findPay(this.price(get), get.type !== 'egg');
      if (pay) return { get, pay };
    }
    const get = order[0];
    const owned = TANK.ownedSpecies();
    if (!owned.length) return null;
    return { get, pay: { sp: owned[0], n: Math.max(1, Math.round(this.price(get) / SP[owned[0]].value)) } };
  },

  accept() {
    const tr = this.active;
    if (!tr || tr.dealt) return;
    const { pay, get } = tr.offer;
    if (TANK.count(pay.sp) < pay.n) { UI.toast('not enough ' + SP[pay.sp].name); return; }
    if (get.type === 'egg' && TANK.capacity - TANK.total() < 2) { UI.toast('no room'); return; }
    tr.dealt = true;
    UI.hideOffer();
    TANK.takeFish(pay.sp, pay.n, () => ({ x: tr.x, y: tr.y }), f => TANK.release(f.sp, 1, STATE.depth), () => {
      if (get.type === 'egg') {
        const W = innerWidth, H = innerHeight;
        for (let i = 0; i < 2; i++)
          TANK.eggs.push({ sp: get.sp, x: clamp(tr.x + rnd(-30, 30), 60, W - 60), y: clamp(tr.y + rnd(10, 40), 80, H - 200), t: rnd(0, 1.5) });
      } else {
        TANK.capacity += get.amount;
        UI.toast('the tank grows · ' + TANK.capacity);
      }
      tr.leaving = true;
      tr.speed = 60;
    });
  },

  pass() {
    const tr = this.active;
    if (!tr) return;
    tr.leaving = true;
    tr.speed = 70;
    UI.hideOffer();
  },

  draw(ctx, t) {}
};
