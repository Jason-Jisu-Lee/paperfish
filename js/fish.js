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
    this.curSpeed = 20;
    this.baseMul = rnd(0.8, 1.3);
    this.baseTarget = this.baseMul;
    this.baseT = rnd(10, 22);
    this.mood = 'cruise';
    this.moodMul = 1;
    this.moodTarget = 1;
    this.moodEase = 1.5;
    this.moodT = rnd(0.8, 2);
    this.dashT = rnd(75, 130);
    this.dead = false;
    this.pairPt = null;
    this.leaveTarget = null;
    this.onLeft = null;
    this.leaveMul = 0;
  }
  pickTarget(W, H, far) {
    const preferSteep = !far && Math.random() < 0.06;
    let tx = this.tx, ty = this.ty;
    for (let tries = 0; tries < 8; tries++) {
      tx = rnd(50, W - 50);
      ty = rnd(80, H - 150);
      if (far) {
        if (Math.hypot(tx - this.x, ty - this.y) > Math.min(W, H) * 0.4) break;
        continue;
      }
      const steepness = Math.abs(ty - this.y) / (Math.abs(tx - this.x) + 1);
      if (preferSteep ? steepness > 1.4 : steepness < 0.7) break;
    }
    this.tx = tx; this.ty = ty;
    this.wanderT = rnd(3, 7);
    this.diving = !far && (Math.abs(ty - this.y) / (Math.abs(tx - this.x) + 1)) > 1.4;
  }
  pickMood(W, H) {
    const r = Math.random();
    if (r < 0.42) {
      this.mood = 'brisk';
      this.moodTarget = rnd(1.5, 2.1);
      this.moodT = rnd(0.6, 1.5);
      this.moodEase = rnd(2.2, 3.6);
    } else if (r < 0.58) {
      this.mood = 'rest';
      this.moodTarget = rnd(0.12, 0.38);
      this.moodT = rnd(0.9, 2.1);
      this.moodEase = rnd(1.3, 2.3);
      this.tx = clamp(this.x + rnd(-28, 28), 50, W - 50);
      this.ty = clamp(this.y + rnd(-20, 20), 80, H - 150);
      this.wanderT = this.moodT + 0.5;
      this.diving = false;
    } else {
      this.mood = 'cruise';
      this.moodTarget = rnd(0.75, 1.4);
      this.moodT = rnd(0.8, 2.2);
      this.moodEase = rnd(1.2, 2.6);
    }
  }
  triggerDash(W, H) {
    this.mood = 'dash';
    this.moodTarget = rnd(2.4, 3.8);
    this.moodT = rnd(0.4, 0.8);
    this.moodEase = rnd(3.8, 6.2);
    this.pickTarget(W, H, true);
    FX.bubbleBurst(this.x, this.y);
  }
  update(dt, t, W, H) {
    const s = SP[this.sp];
    if (this.scale < 1) this.scale = Math.min(1, this.scale + dt / 30);
    if (this.state === 'pairing') {
      const Ax = 15, Ay = 3, w = 0.55;
      const o = t * w + this.phase;
      this.x = clamp(this.pairPt.x + Math.cos(o) * Ax, 30, W - 30);
      this.y = clamp(this.pairPt.y + Math.sin(o) * Ay, 60, H - 60);
      this.dir = Math.atan2(Math.cos(o) * Ay, -Math.sin(o) * Ax);
      return;
    }
    let target = null;
    let mul = 1;
    let turnEase = 2.4;
    if (this.state === 'swim') {
      this.wanderT -= dt;
      if (this.wanderT <= 0 || Math.hypot(this.tx - this.x, this.ty - this.y) < 22) this.pickTarget(W, H, false);
      this.dashT -= dt;
      if (this.dashT <= 0) { this.dashT = rnd(75, 130); this.triggerDash(W, H); }
      else {
        this.moodT -= dt;
        if (this.moodT <= 0) this.pickMood(W, H);
      }
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
    this.curSpeed = speed;
    if (target) {
      const dx = target.x - this.x, dy = target.y - this.y;
      if (dx * dx + dy * dy > 20) {
        const want = Math.atan2(dy, dx);
        const diff = angDiff(want, this.dir);
        const boost = Math.abs(diff) > 1.6 ? 2.4 : 1;
        this.dir += diff * Math.min(1, dt * turnEase * boost);
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
    const bob = Math.sin(t * 1.8 + this.phase) * 2.2;
    const face = Math.cos(this.dir) >= 0 ? 1 : -1;
    const localAngle = face >= 0 ? this.dir : Math.PI - this.dir;
    let wobble = 0;
    if (this.state !== 'pairing') {
      const sp = Math.min(this.curSpeed || 20, 110);
      const freq = 3.2 + sp * 0.05;
      const amp = 0.09 + Math.min(0.14, sp * 0.0018);
      wobble = Math.sin(t * freq + this.phase * 3) * amp;
    }
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.scale(face, 1);
    ctx.rotate(localAngle + (face >= 0 ? wobble : -wobble));
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
