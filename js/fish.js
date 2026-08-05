let FISH_SEQ = 1;

class Fish {
  constructor(spId, x, y) {
    const s = SP[spId];
    this.id = FISH_SEQ++;
    this.sp = spId;
    this.x = x; this.y = y;
    this.dir = rnd(0, TAU);
    this.phase = rnd(0, TAU);
    this.scale = rnd(0.92, 1.08);
    this.payT = rnd(0, ECON.interval);
    this.tx = x; this.ty = y;
    this.diving = false;
    this.moving = true;
    this.legMul = 1;
    this.legDist = 1;
    this.legT = 0;
    this.restT = 0;
    this.hoverT = 0;
    this.dashT = rnd(MOVE.dashIntervalMin, MOVE.dashIntervalMax);
    this.dashUntil = 0;
    this.dashMul = 1;
    this.bend = 0;
    this.indivMul = rnd(MOVE.indivMulMin, MOVE.indivMulMax);
  }
  pickTargetAngled(W, H, far) {
    const preferSteep = !far && Math.random() < MOVE.diveChance;
    if (preferSteep) {
      const dist = rnd(MOVE.diveDistMin, MOVE.diveDistMax);
      const fromVert = rnd(90 - MOVE.diveMaxAngleDeg, 90 - MOVE.diveMinAngleDeg) * Math.PI / 180;
      const updown = Math.random() < 0.5 ? -1 : 1;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.tx = clamp(this.x + Math.sin(fromVert) * side * dist, 50, W - 50);
      this.ty = clamp(this.y + Math.cos(fromVert) * updown * dist, 80, H - 150);
      this.diving = true;
      return;
    }
    const normalMax = Math.tan(MOVE.normalMaxAngleDeg * Math.PI / 180);
    const dashMax = Math.tan(MOVE.dashTargetMaxAngleDeg * Math.PI / 180);
    let tx = this.tx, ty = this.ty, ok = false;
    for (let tries = 0; tries < 20; tries++) {
      tx = rnd(50, W - 50);
      ty = rnd(80, H - 150);
      const steepness = Math.abs(ty - this.y) / (Math.abs(tx - this.x) + 1);
      if (far) {
        if (Math.hypot(tx - this.x, ty - this.y) > Math.min(W, H) * 0.4 && steepness < dashMax) { ok = true; break; }
        continue;
      }
      if (steepness < normalMax) { ok = true; break; }
    }
    if (!ok) {
      const dx = (Math.random() < 0.5 ? -1 : 1) * rnd(120, 320);
      const dy = (Math.random() < 0.5 ? -1 : 1) * Math.abs(dx) * rnd(0, far ? dashMax : normalMax);
      tx = clamp(this.x + dx, 50, W - 50);
      ty = clamp(this.y + dy, 80, H - 150);
    }
    this.tx = tx; this.ty = ty;
    this.diving = false;
  }
  startLeg(W, H) {
    this.pickTargetAngled(W, H, false);
    this.legDist = Math.max(1, Math.hypot(this.tx - this.x, this.ty - this.y));
    this.legT = 0;
    const r = Math.random();
    this.legMul = r < MOVE.sprintChance ? rnd(MOVE.sprintMulMin, MOVE.sprintMulMax)
      : r < MOVE.sprintChance + MOVE.briskChance ? rnd(MOVE.briskMulMin, MOVE.briskMulMax)
      : rnd(MOVE.cruiseMulMin, MOVE.cruiseMulMax);
    this.moving = true;
  }
  startRest(W, H) {
    this.moving = false;
    const long = Math.random() < MOVE.restLongChance;
    this.restT = long ? rnd(MOVE.restLongMin, MOVE.restLongMax) : rnd(MOVE.restShortMin, MOVE.restShortMax);
    this.hoverT = 0;
    this.diving = false;
  }
  update(dt, t, W, H) {
    const s = SP[this.sp];
    let target = null;
    let mul = 1;
    let turnEase = MOVE.turnEaseNormal;
    this.dashT -= dt;
    if (this.dashUntil > 0) {
      this.dashUntil -= dt;
      mul = this.dashMul;
      turnEase = MOVE.turnEaseNormal * 1.4;
      target = { x: this.tx, y: this.ty };
      if (Math.hypot(this.tx - this.x, this.ty - this.y) < 26 || this.dashUntil <= 0) {
        this.dashUntil = 0;
        this.startLeg(W, H);
      }
    } else if (this.dashT <= 0) {
      this.dashT = rnd(MOVE.dashIntervalMin, MOVE.dashIntervalMax);
      this.dashMul = rnd(MOVE.dashMulMin, MOVE.dashMulMax);
      this.dashUntil = Math.random() < MOVE.dashLongChance ? rnd(MOVE.dashLongMin, MOVE.dashLongMax) : rnd(MOVE.dashShortMin, MOVE.dashShortMax);
      this.pickTargetAngled(W, H, true);
      this.diving = false;
      FX.bubbleBurst(this.x, this.y);
      mul = this.dashMul;
      target = { x: this.tx, y: this.ty };
    } else if (this.moving) {
      this.legT += dt;
      const distNow = Math.hypot(this.tx - this.x, this.ty - this.y);
      const progress = clamp(1 - distNow / this.legDist, 0, 1);
      let speedMul = this.legMul;
      if (progress > MOVE.arriveSlowStart) {
        const k = clamp((progress - MOVE.arriveSlowStart) / (MOVE.arriveSlowEnd - MOVE.arriveSlowStart), 0, 1);
        speedMul = lerp(this.legMul, this.legMul * MOVE.arriveSlowFloor, k);
        turnEase = MOVE.turnEaseSlow;
      }
      mul = speedMul * (this.diving ? MOVE.diveSpeedMul : 1);
      target = { x: this.tx, y: this.ty };
      const arriveR = Math.max(22, s.spd * mul * this.indivMul * MOVE.arriveSpeedFactor);
      if (distNow < arriveR || progress >= 0.995 || this.legT > MOVE.legTimeout) {
        if (Math.random() < MOVE.restChance) this.startRest(W, H);
        else this.startLeg(W, H);
      }
    } else {
      this.restT -= dt;
      this.hoverT -= dt;
      if (this.hoverT <= 0) {
        this.hoverT = rnd(1.2, 2.4);
        this.tx = clamp(this.x + rnd(-22, 22), 50, W - 50);
        this.ty = clamp(this.y + rnd(-16, 16), 80, H - 150);
      }
      mul = rnd(MOVE.restMulMin, MOVE.restMulMax);
      turnEase = MOVE.turnEaseSlow;
      target = { x: this.tx, y: this.ty };
      if (this.restT <= 0) this.startLeg(W, H);
    }
    const speed = s.spd * mul * this.indivMul;
    if (target) {
      const dx = target.x - this.x, dy = target.y - this.y;
      if (dx * dx + dy * dy > 20) {
        const want = Math.atan2(dy, dx);
        const diff = angDiff(want, this.dir);
        const boost = Math.abs(diff) > MOVE.bigReversalThresholdRad ? MOVE.bigReversalBoost : 1;
        this.dir += diff * Math.min(1, dt * turnEase * boost);
      }
    }
    const vx = Math.cos(this.dir) * speed, vy = Math.sin(this.dir) * speed;
    this.x += vx * dt; this.y += vy * dt;
    this.x = clamp(this.x, 30, W - 30); this.y = clamp(this.y, 60, H - 60);
    this.easeBend(dt);
  }
  easeBend(dt) {
    const maxK = Math.tan(MOVE.bendMaxDeg * Math.PI / 180);
    const target = clamp(Math.sin(this.dir), -1, 1) * maxK;
    this.bend += (target - this.bend) * Math.min(1, dt * MOVE.bendEase);
  }
  draw(ctx, t, alpha = 1) {
    const s = SP[this.sp];
    const img = ASSETS.ras[this.sp];
    if (!img) return;
    const w = s.size * this.scale, h = w * s.asp;
    const bob = Math.sin(t * 1.8 + this.phase) * 2.2;
    const face = Math.cos(this.dir) >= 0 ? 1 : -1;
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.scale(face, 1);
    ctx.transform(1, this.bend, 0, 1, 0, 0);
    if (s.lamp) {
      const lx = (s.lamp.x - 0.5) * w, ly = (s.lamp.y - 0.5) * h;
      const pr = w * (0.55 + 0.08 * Math.sin(t * 2.1 + this.phase));
      const g = ctx.createRadialGradient(lx, ly, 1, lx, ly, pr);
      g.addColorStop(0, 'rgba(255,215,94,0.32)');
      g.addColorStop(1, 'rgba(255,215,94,0)');
      ctx.fillStyle = g;
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.arc(lx, ly, pr, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
