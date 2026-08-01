const UI = {
  el: {},
  sel: {},
  panelMode: null,
  toastTimer: null,

  init() {
    for (const id of ['depthlabel', 'count', 'indexbtn', 'resetbtn', 'offer', 'offerwant', 'offerget', 'deal', 'pass', 'panel', 'paneltitle', 'panelrows', 'panelsum', 'panelok', 'panelcancel', 'indexov', 'indexgrid', 'toast', 'fishtip', 'endov', 'endtext', 'endindex', 'again'])
      this.el[id] = document.getElementById(id);
    this.el.deal.addEventListener('click', () => TRADER.accept());
    this.el.pass.addEventListener('click', () => TRADER.pass());
    this.el.indexbtn.addEventListener('click', () => this.toggleIndex());
    this.el.indexov.addEventListener('click', e => { if (e.target === this.el.indexov) this.el.indexov.hidden = true; });
    this.el.panelcancel.addEventListener('click', () => { this.el.panel.hidden = true; });
    this.el.panelok.addEventListener('click', () => this.confirmPanel());
    this.el.again.addEventListener('click', () => SAVE.reset());
    this.el.resetbtn.addEventListener('click', () => {
      if (this.resetArmed) { SAVE.reset(); return; }
      this.resetArmed = true;
      this.el.resetbtn.textContent = 'sure?';
      setTimeout(() => { this.resetArmed = false; this.el.resetbtn.textContent = 'reset'; }, 3000);
    });
    addEventListener('keydown', e => {
      if (e.key === 'Escape') { this.el.panel.hidden = true; this.el.indexov.hidden = true; }
    });
  },

  anyOpen() {
    return !this.el.panel.hidden || !this.el.indexov.hidden;
  },

  updateHud() {
    this.el.depthlabel.textContent = DEPTHS[STATE.depth].label;
    this.el.count.textContent = TANK.total() + ' / ' + TANK.capacity;
  },

  hideHud() {
    this.el.depthlabel.hidden = true;
    this.el.count.hidden = true;
    this.el.indexbtn.hidden = true;
    this.el.resetbtn.hidden = true;
  },

  showOffer(o) {
    this.el.offerwant.textContent = 'trader wants ' + o.pay.n + ' ' + SP[o.pay.sp].name;
    this.el.offerget.textContent = o.get.type === 'egg'
      ? 'offers two ' + SP[o.get.sp].name + ' eggs'
      : 'offers +' + o.get.amount + ' room';
    this.el.offer.hidden = false;
  },

  hideOffer() {
    this.el.offer.hidden = true;
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

  buildPanel(mode) {
    this.panelMode = mode;
    this.sel = {};
    const rows = this.el.panelrows;
    rows.innerHTML = '';
    for (const spId of TANK.ownedSpecies()) {
      const cnt = TANK.count(spId);
      if (cnt < 1) continue;
      this.sel[spId] = 0;
      const row = document.createElement('div');
      row.className = 'prow';
      const name = document.createElement('span');
      name.className = 'pname';
      name.textContent = SP[spId].name;
      const own = document.createElement('span');
      own.className = 'pown';
      own.textContent = '×' + cnt;
      const minus = document.createElement('button');
      minus.className = 'pbtn';
      minus.textContent = '−';
      const val = document.createElement('span');
      val.className = 'pval';
      val.textContent = '0';
      const plus = document.createElement('button');
      plus.className = 'pbtn';
      plus.textContent = '+';
      minus.addEventListener('click', () => { this.bump(spId, -1, val); });
      plus.addEventListener('click', () => { this.bump(spId, 1, val); });
      row.append(name, own, minus, val, plus);
      rows.append(row);
    }
    this.refreshSum();
  },

  limit() {
    return this.panelMode === 'gate'
      ? GATE.need() - GATE.fed
      : DEPTHS[STATE.depth].carry;
  },

  sum() {
    let s = 0;
    for (const k in this.sel) s += this.sel[k];
    return s;
  },

  bump(spId, d, valEl) {
    const next = this.sel[spId] + d;
    if (next < 0 || next > TANK.count(spId)) return;
    if (d > 0 && this.sum() >= this.limit()) return;
    this.sel[spId] = next;
    valEl.textContent = next;
    this.refreshSum();
  },

  refreshSum() {
    if (this.panelMode === 'gate')
      this.el.panelsum.textContent = this.sum() + ' chosen · the gate takes ' + (GATE.need() - GATE.fed) + ' more';
    else
      this.el.panelsum.textContent = this.sum() + ' / ' + this.limit() + ' carried down';
  },

  showGatePanel() {
    this.buildPanel('gate');
    this.el.paneltitle.textContent = 'feed the gate';
    this.el.panelok.textContent = 'release';
    this.el.panel.hidden = false;
  },

  showCarryPanel() {
    this.buildPanel('carry');
    this.el.paneltitle.textContent = 'the gate opens · choose what comes down';
    this.el.panelok.textContent = 'descend';
    this.el.panel.hidden = false;
  },

  confirmPanel() {
    if (this.panelMode === 'gate') {
      if (this.sum() > 0) {
        if (!TANK.keepsPair(this.sel)) { this.toast('keep a pair'); return; }
        GATE.feed(this.sel, innerWidth, innerHeight);
      }
      this.el.panel.hidden = true;
    } else {
      let pair = false;
      for (const k in this.sel) if (this.sel[k] >= 2) pair = true;
      if (!pair) { this.toast('carry a pair'); return; }
      this.el.panel.hidden = true;
      MAIN.descend(this.sel);
    }
  },

  toggleIndex() {
    if (!this.el.indexov.hidden) { this.el.indexov.hidden = true; return; }
    const grid = this.el.indexgrid;
    grid.innerHTML = '';
    for (const s of SPECIES) {
      const un = STATE.index.has(s.id);
      const cell = document.createElement('div');
      cell.className = 'cell' + (un ? '' : ' locked');
      const img = document.createElement('img');
      img.src = 'assets/' + s.id + '.svg?v=4';
      const cn = document.createElement('div');
      cn.className = 'cname';
      cn.textContent = un ? s.name : '?';
      cell.append(img, cn);
      if (un) {
        const st = document.createElement('div');
        st.className = 'cstat';
        st.textContent = 'keeps ' + s.max + ' · breeds ' + s.breed + 's · worth ' + s.value;
        cell.append(st);
      }
      grid.append(cell);
    }
    this.el.indexov.hidden = false;
  },

  fishTip(f, cx, cy) {
    const tip = this.el.fishtip;
    tip.textContent = SP[f.sp].name + (f.scale < 0.95 ? ' · young' : '');
    tip.style.left = cx + 12 + 'px';
    tip.style.top = cy - 8 + 'px';
    tip.hidden = false;
    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => { tip.hidden = true; }, 1600);
  },

  showEnd(n) {
    this.hideOffer();
    this.el.endtext.textContent = 'the tank is empty. the ocean is not.';
    this.el.endindex.textContent = 'index ' + n + ' / ' + SPECIES.length;
    this.el.endov.hidden = false;
  }
};
