const Lantern = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  let lan = null, nextT = 0, idSeq = 0, radius = 0;

  const measure = () => {
    const sp = SPECIES.find(s => s.file === 'ray');
    radius = 0.9 * (sp.len / sp.vb[0]) * 3.9 * sp.vb[1];
  };

  const start = () => {
    if (!radius) measure();
    lan = null;
    nextT = rand(lantMin(), lantMax());
    for (const f of Game.fish) {
      delete f.lant;
      delete f.lanSeen;
    }
  };

  const spawn = () => {
    const o = Stage.open;
    let x = (o.l + o.r) / 2;
    for (let i = 0; i < 20; i++) {
      x = rand(o.l + 60, o.r - 60);
      if (!Stage.uiBlocked(x, o.t + 40)) break;
    }
    lan = { id: ++idSeq, x, y: o.t + 26, charges: 3, ph: rand(0, 7), fade: 0, gone: false };
  };

  const pay = () => {
    Game.gold += lantGold();
    Stage.spawnPop(lan.x, lan.y - 26, '+' + fmtG(lantGold()) + ' G', 'gold');
    lan.charges -= 1;
    lan.jolt = 1;
    if (lan.charges <= 0) lan.gone = true;
  };

  const hit = (x, y) => lan && !lan.gone && Math.hypot(x - lan.x, y - lan.y) < 24;

  const clickAt = (x, y) => {
    if (!Game.started || !hit(x, y)) return false;
    pay();
    return true;
  };

  const hoverAt = (x, y) => !!(Game.started && hit(x, y));

  const update = mdt => {
    if (!Game.started || !mdt) return;
    if (!lan) {
      nextT -= mdt;
      if (nextT <= 0) spawn();
      return;
    }
    lan.ph += mdt * 1.1;
    lan.jolt = Math.max((lan.jolt || 0) - mdt * 4, 0);
    if (lan.gone) {
      for (const f of Game.fish) delete f.lant;
      lan.fade += mdt / 0.8;
      if (lan.fade >= 1) {
        lan = null;
        nextT = rand(lantMin(), lantMax());
      }
      return;
    }
    lan.y += 6.5 * mdt;
    lan.x += Math.sin(lan.ph * 0.7) * 6 * mdt;
    if (lan.y > Stage.open.b - 20) lan.gone = true;
    const chance = lantTapChance();
    for (const f of Game.fish) {
      if (f.egg || f.dying !== undefined || f.birth < 1 || f.eating) continue;
      if (f.lant) {
        f.lant.x = lan.x;
        f.lant.y = lan.y;
        const hx = f.x + (f.dir > 0 ? 1 : -1) * SPECIES[f.s].len * 0.4;
        if (Math.hypot(hx - lan.x, f.y - lan.y) < 7) {
          pay();
          if (!Game.tuts.goodFish) {
            Game.tuts.goodFish = 1;
            Say.say('Good fish');
          }
          delete f.lant;
        }
        continue;
      }
      if (!chance || f.lanSeen === lan.id || tierOf(f.s) !== 1) continue;
      if (Math.hypot(f.x - lan.x, f.y - lan.y) < radius) {
        f.lanSeen = lan.id;
        if (Math.random() < chance) f.lant = { x: lan.x, y: lan.y };
      }
    }
  };

  const draw = ctx => {
    if (!Game.started || !lan) return;
    const a = lan.gone ? Math.max(1 - lan.fade, 0) : 1;
    if (a <= 0) return;
    const lit = lan.charges / 3;
    const x = lan.x, y = lan.y + Math.sin(lan.ph * 1.4) * 4 + (lan.jolt || 0) * 3;
    ctx.save();
    ctx.globalAlpha = a;
    if (lit > 0) {
      const g = ctx.createRadialGradient(x, y, 2, x, y, 48);
      g.addColorStop(0, 'rgba(190,150,40,' + 0.15 * lit + ')');
      g.addColorStop(1, 'rgba(190,150,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 48, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.translate(x, y);
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
      ctx.ellipse(0, 1 + Math.sin(lan.ph * 4.5) * 0.6, 2.4, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (Game.devReveal && !lan.gone) {
      ctx.save();
      ctx.strokeStyle = 'rgba(62,84,110,0.42)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(lan.x, lan.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  return { start, update, draw, clickAt, hoverAt };
})();
