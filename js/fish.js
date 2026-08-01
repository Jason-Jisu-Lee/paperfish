let FISH_SEQ = 1;

class Fish {
  constructor(spId, x, y, juv) {
    const s = SP[spId];
    this.id = FISH_SEQ++;
    this.sp = spId;
    this.x = x; this.y = y;
    this.dir = rnd(0, TAU);
    this.phase = rnd(0, TAU);
    this.scale = juv ? 0.45 : 1;
    this.state = 'swim';
    this.wanderT = 0;
    this.tx = x; this.ty = y;
    this.diving = false;
    this.baseMul = rnd(0.8, 1.3);
    this.baseTarget = this.baseMul;
    this.baseT = rnd(10, 22);
    this.mood = 'cruise';
    this.moodMul = 1;
    this.moodTarget = 1;
    this.moodEase = 1.5;
    this.moodT = rnd(1, 2.4);
    this.dead = false;
    this.pairPt = null;
    this.leaveTarget = null;
    this.onLeft = null;
    this.leaveMul = 0;
  }
  pickTarget(W, H, far) {
    const preferSteep = !far && Math.random() < 0.12;
    let tx = this.tx, ty = this.ty;
    for (let tries = 0; tries < 7; tries++) {
      tx = rnd(50, W - 50);
      ty = rnd(80, H - 150);
      if (far) {
        if (Math.hypot(tx - this.x, ty - this.y) > Math.min(W, H) * 0.4) break;
        continue;
      }
      const steepness = Math.abs(ty - this.y) / (Math.abs(tx - this.x) + 1);
      if (preferSteep ? steepness > 1.3 : steepness < 1.15) break;
    }
    this.tx = tx; this.ty = ty;
    this.wanderT = rnd(3, 7);
    this.diving = !far && (Math.abs(ty - this.y) / (Math.abs(tx - this.x) + 1)) > 1.3;
  }
  pickMood(W, H) {
    const r = Math.random();
    if (r < 0.14) {
      this.mood = 'dash';
      this.moodTarget = rnd(2.3, 3.6);
      this.moodT = rnd(0.4, 0.9);
      this.moodEase = rnd(3.5, 6);
      this.pickTarget(W, H, true);
      FX.bubbleBurst(this.x, this.y);
    } else if (r < 0.32) {
      this.mood = 'brisk';
      this.moodTarget = rnd(1.4, 2.0);
      this.moodT = rnd(0.7, 1.7);
      this.moodEase = rnd(2, 3.4);
    } else if (r < 0.46) {
      this.mood = 'rest';
      this.moodTarget = rnd(0.15, 0.42);
      this.moodT = rnd(1.1, 2.4);
      this.moodEase = rnd(1.2, 2.2);
      this.tx = clamp(this.x + rnd(-30, 30), 50, W - 50);
      this.ty = clamp(this.y + rnd(-22, 22), 80, H - 150);
      this.wanderT = this.moodT + 0.6;
      this.diving = false;
      if (this.y > H - 200) FX.sedimentPuff(this.x, this.y + SP[this.sp].size * 0.25);
    } else {
      this.mood = 'cruise';
      this.moodTarget = rnd(0.7, 1.35);
      this.moodT = rnd(1, 2.6);
      this.moodEase = rnd(1, 2.4);
    }
  }
  update(dt, t, W, H) {
    const s = SP[this.sp];
    if (this.scale < 1) this.scale = Math.min(1, this.scale + dt / 30);
    if (this.state === 'pairing') {
      const R = 16, Ry = 10, w = 0.7;
      const o = t * w + this.phase;
      this.x = clamp(this.pairPt.x + Math.cos(o) * R, 30, W - 30);
      this.y = clamp(this.pairPt.y + Math.sin(o) * Ry, 60, H - 60);
      this.dir = Math.atan2(Math.cos(o) * Ry, -Math.sin(o) * R);
      return;
    }
    let target = null;
    let mul = 1;
    let turnEase = 2.4;
    if (this.state === 'swim') {
      this.wanderT -= dt;
      if (this.wanderT <= 0 || Math.hypot(this.tx - this.x, this.ty - this.y) < 22) this.pickTarget(W, H, false);
      this.moodT -= dt;
      if (this.moodT <= 0) this.pickMood(W, H);
      this.moodMul += (this.moodTarget - this.moodMul) * Math.min(1, dt * this.moodEase);
      this.baseT -= dt;
      if (this.baseT <= 0) { this.baseTarget = rnd(0.75, 1.35); this.baseT = rnd(12, 24); }
      this.baseMul += (this.baseTarget - this.baseMul) * Math.min(1, dt * 0.35);
      mul = this.baseMul * this.moodMul * (this.diving ? 1.75 : 1);
      turnEase = this.mood === 'dash' ? 2.6 : this.mood === 'rest' ? 0.9 : 1.5;
      target = { x: this.tx, y: this.ty };
    } else if (this.state === 'pairto') {
      target = this.pairPt;
      mul = 1.3;
    } else if (this.state === 'leave') {
      if (!this.leaveMul) this.leaveMul = rnd(3.8, 5.2);
      target = this.leaveTarget();
      mul = this.leaveMul;
      turnEase = 4.5;
      if (Math.hypot(target.x - this.x, target.y - this.y) < 18) {
        this.dead = true;
        if (this.onLeft) this.onLeft();
        return;
      }
    }
    const speed = s.spd * mul;
    if (target) {
      const dx = target.x - this.x, dy = target.y - this.y;
      if (dx * dx + dy * dy > 20) {
        const want = Math.atan2(dy, dx);
        this.dir += angDiff(want, this.dir) * Math.min(1, dt * turnEase);
      }
    }
    const vx = Math.cos(this.dir) * speed, vy = Math.sin(this.dir) * speed;
    this.x += vx * dt; this.y += vy * dt;
    this.x = clamp(this.x, 30, W - 30); this.y = clamp(this.y, 60, H - 60);
  }
  draw(ctx, t, alpha = 1) {
    const s = SP[this.sp];
    const img = ASSETS.ras[this.sp];
    if (!img) return;
    const w = s.size * this.scale, h = w * s.asp;
    const sway = Math.sin(t * 1.8 + this.phase) * 2.2;
    const face = Math.cos(this.dir) >= 0 ? 1 : -1;
    const localAngle = face >= 0 ? this.dir : Math.PI - this.dir;
    ctx.save();
    ctx.translate(this.x, this.y + sway);
    ctx.scale(face, 1);
    ctx.rotate(localAngle);
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
