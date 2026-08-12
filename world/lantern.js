const Lantern = (() => {
  const lanterns = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  let mode = 'idle', queue = 0, spawnT = 0, collected = 0, nextT = 0, tNow = 0;

  const start = () => {
    lanterns.length = 0;
    collected = 0;
    if (Game.tuts && Game.tuts.lantern) {
      mode = 'recur';
      nextT = rand(30, 60);
    } else {
      mode = 'idle';
    }
  };

  const begin = () => {
    if (mode === 'obj' || (Game.tuts && Game.tuts.lantern)) return;
    mode = 'obj';
    collected = 0;
    queue = 3;
    spawnT = 0;
  };

  const spawn = () => {
    const b = Stage.bounds;
    const fromLeft = Math.random() < 0.5;
    lanterns.push({
      x: fromLeft ? b.l - 30 : b.r + 30,
      y: rand(b.t + 20, b.b - 40),
      dir: fromLeft ? 1 : -1,
      taps: 0,
      jolt: 0,
      ph: rand(0, Math.PI * 2),
      fade: 1,
      spent: false
    });
  };

  const update = mdt => {
    if (!Game.started || !mdt) return;
    tNow += mdt;
    if (queue > 0) {
      spawnT -= mdt;
      if (spawnT <= 0) {
        spawn();
        queue -= 1;
        spawnT = 1.4;
      }
    } else if (mode === 'recur' && lanterns.length === 0) {
      nextT -= mdt;
      if (nextT <= 0) {
        spawn();
        nextT = rand(45, 90);
      }
    }
    const b = Stage.bounds;
    for (let i = lanterns.length - 1; i >= 0; i--) {
      const l = lanterns[i];
      l.ph += mdt * 1.1;
      l.jolt = Math.max(l.jolt - mdt * 4, 0);
      if (l.spent) {
        l.fade -= mdt * 0.8;
        if (l.fade <= 0) lanterns.splice(i, 1);
        continue;
      }
      l.x += l.dir * 16 * mdt;
      if (mode === 'obj') {
        if (l.x < b.l + 26 && l.dir < 0) l.dir = 1;
        if (l.x > b.r - 26 && l.dir > 0) l.dir = -1;
      } else if (l.x < b.l - 40 || l.x > b.r + 40) {
        lanterns.splice(i, 1);
      }
    }
  };

  const clickAt = (x, y) => {
    for (const l of lanterns) {
      if (l.spent) continue;
      if (Math.abs(x - l.x) < 26 && Math.abs(y - l.y) < 32) {
        l.taps += 1;
        l.jolt = 1;
        Game.gold += 5;
        Stage.spawnPop(l.x, l.y - 28, '+5', true);
        if (l.taps >= 3) {
          l.spent = true;
          if (mode === 'obj') {
            collected += 1;
            if (collected >= 3) {
              mode = 'recur';
              nextT = rand(40, 70);
              Obj.event('lantern');
            }
          }
        }
        return true;
      }
    }
    return false;
  };

  const hoverAt = (x, y) => {
    for (const l of lanterns) {
      if (!l.spent && Math.abs(x - l.x) < 26 && Math.abs(y - l.y) < 32) return true;
    }
    return false;
  };

  const draw = ctx => {
    for (const l of lanterns) {
      const lit = 1 - l.taps / 3;
      const y = l.y + Math.sin(l.ph * 1.4) * 4 + l.jolt * 3;
      ctx.save();
      ctx.globalAlpha = Math.max(l.fade, 0);
      if (lit > 0) {
        const g = ctx.createRadialGradient(l.x, y, 2, l.x, y, 48);
        g.addColorStop(0, 'rgba(190,150,40,' + 0.15 * lit + ')');
        g.addColorStop(1, 'rgba(190,150,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(l.x, y, 48, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.translate(l.x, y);
      ctx.strokeStyle = 'rgba(28,27,24,0.8)';
      ctx.fillStyle = 'rgba(255,251,240,' + (0.35 + 0.3 * lit) + ')';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-9, -12);
      ctx.bezierCurveTo(-13, -4, -13, 6, -9, 14);
      ctx.lineTo(9, 14);
      ctx.bezierCurveTo(13, 6, 13, -4, 9, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-11.6, -3);
      ctx.lineTo(11.6, -3);
      ctx.moveTo(-11.9, 4);
      ctx.lineTo(11.9, 4);
      ctx.stroke();
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-5, -15, 10, 3);
      ctx.strokeRect(-5, 14, 10, 3);
      if (lit > 0) {
        ctx.fillStyle = 'rgba(170,125,20,' + (0.5 * lit + 0.2) + ')';
        ctx.beginPath();
        ctx.ellipse(0, 1 + Math.sin(tNow * 5 + l.ph) * 0.6, 2.4, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  return { start, begin, update, draw, clickAt, hoverAt, get collected() { return collected; } };
})();
