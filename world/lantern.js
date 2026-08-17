const Lantern = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  let lan = null, nextT = 0, idSeq = 0, radius = 0;

  const measure = () => {
    const sp = SPECIES.find(s => s.file === 'ray');
    radius = 0.9 * (sp.len / sp.vb[0]) * 3.9 * sp.vb[1];
  };

  const ART = {
    loop: new Path2D('M30 3 L30 9 M21 9 L39 9'),
    body: new Path2D('M30 11 C45 11 52 23 52 40 C52 57 45 68 30 68 C15 68 8 57 8 40 C8 23 15 11 30 11 Z'),
    ribs: new Path2D('M9.5 27 C22 31 38 31 50.5 27 M8 41 C22 45 38 45 52 41 M9.5 55 C22 59 38 59 50.5 55'),
    foot: new Path2D('M23 68 L37 68 M30 68 L30 80')
  };
  const SC = 0.77;

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
          if (!Game.tuts.goodFish) {
            Game.tuts.goodFish = 1;
            Say.say('Good fish');
          }
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
    const x = lan.x, y = lan.y + Math.sin(lan.ph * 2 * Math.PI / 4.2) * 4;
    const heat = lan.charges / 3;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.scale(SC, SC);
    ctx.translate(-30, -40);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.7 / SC;
    ctx.shadowColor = `rgba(226,180,90,${0.45 * (0.25 + heat * 0.75)})`;
    ctx.shadowBlur = 10;
    ctx.fillStyle = `rgba(238,199,113,${0.28 * (0.4 + heat * 0.6)})`;
    ctx.fill(ART.body);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(28,27,24,0.8)';
    ctx.stroke(ART.loop);
    ctx.stroke(ART.body);
    ctx.stroke(ART.ribs);
    ctx.stroke(ART.foot);
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
