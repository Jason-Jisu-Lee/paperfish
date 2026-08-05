const UI = {
  el: {},
  refs: [],
  toastTimer: null,

  init() {
    for (const id of ['goldnum', 'goldrate', 'fishtitle', 'uprows', 'fishrows', 'morefish', 'resetbtn', 'toast', 'fishtip'])
      this.el[id] = document.getElementById(id);
    this.el.resetbtn.addEventListener('click', () => {
      if (this.resetArmed) { SAVE.reset(); return; }
      this.resetArmed = true;
      this.el.resetbtn.textContent = 'sure?';
      setTimeout(() => { this.resetArmed = false; this.el.resetbtn.textContent = 'reset'; }, 3000);
    });
  },

  row(name, sub, right) {
    const btn = document.createElement('button');
    btn.className = 'row';
    const left = document.createElement('span');
    left.className = 'rl';
    const nm = document.createElement('span');
    nm.className = 'rname';
    nm.textContent = name;
    const sb = document.createElement('span');
    sb.className = 'rsub';
    sb.textContent = sub;
    left.append(nm, sb);
    const rt = document.createElement('span');
    rt.className = 'rcost';
    rt.textContent = right;
    btn.append(left, rt);
    return btn;
  },

  build() {
    this.refs = [];
    const iv = tickInterval(STATE.up);
    const up = this.el.uprows;
    up.innerHTML = '';
    for (const u of UPGRADES) {
      const lvl = STATE.up[u.id];
      const maxed = lvl >= u.max;
      const cost = maxed ? 0 : upCost(u, lvl);
      const btn = this.row(u.name + (lvl ? ' · ' + lvl : ''), u.sub, maxed ? 'max' : fmt(cost));
      if (!maxed) {
        btn.addEventListener('click', () => this.buyUpgrade(u));
        this.refs.push({ btn, cost });
      }
      up.append(btn);
    }
    const fr = this.el.fishrows;
    fr.innerHTML = '';
    let shown = 0;
    let nextShown = false;
    for (const s of SPECIES) {
      const owned = TANK.count(s.id);
      if (owned === 0 && nextShown) continue;
      if (owned === 0) nextShown = true;
      shown++;
      const full = owned >= ECON.cap;
      const cost = full ? 0 : fishCost(s, owned);
      const name = owned ? s.name + ' · ' + owned : s.name;
      const sub = '+' + fmt(payoutOf(s, STATE.up)) + ' every ' + iv + 's';
      const btn = this.row(name, sub, full ? 'full' : fmt(cost));
      if (!full) {
        btn.addEventListener('click', () => this.buyFish(s));
        this.refs.push({ btn, cost });
      }
      fr.append(btn);
    }
    const hiddenN = SPECIES.length - shown;
    this.el.morefish.hidden = hiddenN <= 0;
    this.el.morefish.textContent = hiddenN + ' more wait below';
  },

  buyFish(s) {
    const owned = TANK.count(s.id);
    if (owned >= ECON.cap) return;
    const cost = fishCost(s, owned);
    if (STATE.gold < cost) return;
    STATE.gold -= cost;
    TANK.addFish(s.id, rnd(MAIN.W * 0.2, MAIN.W * 0.8), rnd(MAIN.H * 0.25, MAIN.H * 0.7));
    if (owned === 0) this.toast(s.name + ' arrives');
    SAVE.save();
    this.build();
  },

  buyUpgrade(u) {
    const lvl = STATE.up[u.id];
    if (lvl >= u.max) return;
    const cost = upCost(u, lvl);
    if (STATE.gold < cost) return;
    STATE.gold -= cost;
    STATE.up[u.id]++;
    SAVE.save();
    this.build();
  },

  setText(el, s) {
    if (el._t !== s) { el._t = s; el.textContent = s; }
  },

  tick() {
    this.setText(this.el.goldnum, fmt(STATE.gold));
    let sum = 0;
    for (const f of TANK.fishes) sum += payoutOf(SP[f.sp], STATE.up);
    this.setText(this.el.goldrate, '+' + fmt(sum) + ' gold every ' + tickInterval(STATE.up) + 's');
    this.setText(this.el.fishtitle, 'fish · ' + TANK.total());
    for (const r of this.refs) r.btn.classList.toggle('can', STATE.gold >= r.cost);
  },

  toast(msg) {
    const t = this.el.toast;
    clearTimeout(this.toastTimer);
    t.hidden = false;
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.opacity = 1; });
    this.toastTimer = setTimeout(() => {
      t.style.opacity = 0;
      this.toastTimer = setTimeout(() => { t.hidden = true; }, 600);
    }, 2300);
  },

  fishHover(f, cx, cy) {
    const s = SP[f.sp];
    const tip = this.el.fishtip;
    tip.textContent = s.name + ' · +' + fmt(payoutOf(s, STATE.up)) + ' every ' + tickInterval(STATE.up) + 's';
    tip.style.left = Math.min(cx + 14, MAIN.W - 190) + 'px';
    tip.style.top = cy - 10 + 'px';
    tip.hidden = false;
  },

  hideHover() {
    this.el.fishtip.hidden = true;
  }
};
