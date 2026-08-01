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
    this.face = Math.cos(this.dir) > 0 ? -1 : 1;
    this.wanderT = 0;
    this.tx = x; this.ty = y;
    this.speedMul = rnd(0.85, 1.15);
    this.dead = false;
    this.pairPt = null;
    this.leaveTarget = null;
    this.onLeft = null;
  }
  pickTarget(W, H) {
    this.tx = rnd(50, W - 50);
    this.ty = rnd(80, H - 150);
    this.wanderT = rnd(4, 9);
  }
  update(dt, t, W, H) {
    const s = SP[this.sp];
    if (this.scale < 1) this.scale = Math.min(1, this.scale + dt / 30);
    let speed = s.spd * this.speedMul;
    let target = null;
    if (this.state === 'swim') {
      this.wanderT -= dt;
      if (this.wanderT <= 0 || Math.hypot(this.tx - this.x, this.ty - this.y) < 24) this.pickTarget(W, H);
      target = { x: this.tx, y: this.ty };
    } else if (this.state === 'pairto') {
      target = this.pairPt;
      speed *= 1.25;
    } else if (this.state === 'pairing') {
      const o = t * 0.7 + this.phase;
      target = { x: this.pairPt.x + Math.cos(o) * 16, y: this.pairPt.y + Math.sin(o) * 10 };
      speed *= 0.5;
    } else if (this.state === 'leave') {
      target = this.leaveTarget();
      speed *= 1.7;
      if (Math.hypot(target.x - this.x, target.y - this.y) < 18) {
        this.dead = true;
        if (this.onLeft) this.onLeft();
        return;
      }
    }
    if (target) {
      const want = Math.atan2(target.y - this.y, target.x - this.x);
      this.dir += angDiff(want, this.dir) * Math.min(1, dt * (this.state === 'swim' ? 1.1 : 2.4));
    }
    const vx = Math.cos(this.dir) * speed, vy = Math.sin(this.dir) * speed;
    this.x += vx * dt; this.y += vy * dt;
    this.x = clamp(this.x, 30, W - 30); this.y = clamp(this.y, 60, H - 60);
    const wantFace = vx > 2 ? -1 : vx < -2 ? 1 : this.face < 0 ? -1 : 1;
    this.face += (wantFace - this.face) * Math.min(1, dt * 5);
    this.vy = vy;
  }
  draw(ctx, t, alpha = 1) {
    const s = SP[this.sp];
    const img = ASSETS.ras[this.sp];
    if (!img) return;
    const w = s.size * this.scale, h = w * s.asp;
    const sway = Math.sin(t * 1.8 + this.phase) * 2.2;
    const tilt = Math.atan2(this.vy || 0, 34) * 0.55;
    ctx.save();
    ctx.translate(this.x, this.y + sway);
    ctx.scale(this.face, 1);
    ctx.rotate(this.face >= 0 ? tilt : -tilt);
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
