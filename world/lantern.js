const Lantern = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  let lan = null, nextT = 0, idSeq = 0, radius = 0;

  const measure = () => {
    const sp = SPECIES.find(s => s.file === 'ray');
    radius = 1.5 * (sp.len / sp.vb[0]) * 3.9 * sp.vb[1];
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
    lan.ph += mdt;
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
          delete f.lant;
        }
        continue;
      }
      if (!chance || f.lanSeen === lan.id) continue;
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
    const x = lan.x, y = lan.y + Math.sin(lan.ph * 1.6) * 2;
    const heat = lan.charges / 3;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 2, x, y, 36);
    g.addColorStop(0, `rgba(122,88,0,${0.24 * a * heat})`);
    g.addColorStop(1, 'rgba(122,88,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(253,250,241,0.92)';
    ctx.strokeStyle = 'rgba(28,27,24,0.78)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y - 13);
    ctx.bezierCurveTo(x + 11, y - 13, x + 12, y - 5, x + 12, y);
    ctx.bezierCurveTo(x + 12, y + 6, x + 10, y + 13, x, y + 13);
    ctx.bezierCurveTo(x - 10, y + 13, x - 12, y + 6, x - 12, y);
    ctx.bezierCurveTo(x - 12, y - 5, x - 11, y - 13, x, y - 13);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(28,27,24,0.28)';
    ctx.lineWidth = 1;
    for (const dy of [-6.5, 0, 6.5]) {
      const w = 12 - Math.abs(dy) * 0.45;
      ctx.beginPath();
      ctx.moveTo(x - w, y + dy);
      ctx.quadraticCurveTo(x, y + dy + 2.2, x + w, y + dy);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(28,27,24,0.82)';
    ctx.fillRect(x - 6, y - 16.5, 12, 3.2);
    ctx.fillRect(x - 6, y + 13.3, 12, 3.2);
    if (heat > 0) {
      ctx.fillStyle = `rgba(180,58,43,${0.35 + heat * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y - 1 + Math.sin(lan.ph * 5) * 0.7, 2.1 + heat, 0, Math.PI * 2);
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
