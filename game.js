const startGame = () => {
  if (Game.started) return;
  const fresh = !loadGame();
  if (fresh) {
    Game.gold = START_GOLD;
    Game.stream = 0;
    Game.plants = 0;
    Game.unlocked = 1;
    Game.fish = [];
  }
  document.getElementById('hud').removeAttribute('hidden');
  document.getElementById('corner').removeAttribute('hidden');
  Stage.resize();
  Stage.resetPlants();
  Game.fish.forEach((f, i) => Stage.materialize(f, fresh ? i : undefined));
  for (let i = 0; i < Game.plants; i++) Stage.spawnPlant();
  Game.started = true;
  Panel.refresh();
};

(() => {
  let last = 0;
  let saveT = 0;
  let matT = 0;

  const loop = ts => {
    requestAnimationFrame(loop);
    const raw = (ts - last) / 1000;
    last = ts;
    if (!Game.started) return;
    let dt = raw;
    if (!(dt > 0)) dt = 0;
    if (dt > 0.06) dt = 0.06;
    const mdt = Pause.paused ? 0 : dt;
    const sdt = mdt * Game.speed;

    let hatched = false;
    let removed = false;
    let earned = 0;
    for (let i = Game.fish.length - 1; i >= 0; i--) {
      const f = Game.fish[i];
      if (f.egg) {
        f.t += sdt;
        if (f.t >= hatchTime(f.s)) {
          Stage.hatch(f);
          hatched = true;
        }
      } else if (f.dying !== undefined) {
        f.dying += mdt;
        if (f.dying >= 2.8) {
          const pay = ltvOf(f.s) * 0.1;
          Game.gold += pay;
          Stage.spawnPop(f.x, f.y, '+' + fmtG(pay));
          Game.fish.splice(i, 1);
          removed = true;
        }
      } else {
        const sp = SPECIES[f.s];
        const life = lifeOf(f.s);
        f.age = Math.min((f.age || 0) + sdt / 60, life);
        const aAt = adultAtOf(f.s);
        if (aAt !== undefined && !f.adult && f.age >= aAt) {
          f.adult = true;
          f.birth = 0;
        }
        if (sp.hunger) {
          if (f.eating) {
            f.eating.t -= sdt;
            if (f.eating.t <= 0) {
              f.hstate = 0;
              f.hT = 0;
              f.hungerAt = f.age + (1 + Math.random() / 6) / 2;
              delete f.eating;
            }
          } else {
            if (!f.hstate && f.age >= (f.hungerAt || 1)) {
              f.hstate = 1;
              f.hT = 0;
            }
            if (f.hstate) {
              f.hT = (f.hT || 0) + sdt;
              if (f.hstate === 1 && f.hT >= 20) {
                f.hstate = 2;
                f.hT = 0;
              } else if (f.hstate === 2 && f.hT >= 10) {
                f.hstate = 0;
                f.dying = 0;
                continue;
              }
              const p = Stage.nearestPlant(f.x, f.y);
              if (p) {
                const px = p.x + p.hx, pyy = p.y + p.hy;
                if ((px - f.x) ** 2 + (pyy - f.y) ** 2 < 70 * 70) {
                  Stage.biteKelp(p);
                  if (p.bites <= 0) Game.plants -= 1;
                  const side = f.x < px ? -1 : 1;
                  f.dir = -side;
                  f.eating = { t: 2, x: px + side * 13, y: pyy };
                  hatched = true;
                }
              }
            }
          }
        }
        const r = (speciesGpm(f.s, f.age) + streamFor(f.s)) / 60 * sdt;
        earned += r;
        f.acc = (f.acc || 0) + r;
        f.popT = (f.popT || 0) - mdt;
        if (f.acc >= 1 && f.popT <= 0 && f.birth >= 1) {
          const n = Math.floor(f.acc);
          f.acc -= n;
          f.popT = 0.8;
          Stage.spawnPop(f.x, f.y - SPECIES[f.s].len * 0.3 - 8, '+' + n.toLocaleString('en-US'));
        }
        if (f.age >= life && f.birth >= 1) {
          if (f.deathWait === undefined) f.deathWait = 0.4 + Math.random() * 3;
          f.deathWait -= sdt;
          if (f.deathWait <= 0) f.dying = 0;
        }
      }
    }
    Game.gold += earned;

    matT += sdt;
    if (matT >= 0.8) {
      matT = 0;
      const el = Game.fish.filter(f => !f.egg && f.dying === undefined && f.birth >= 1 && !f.mated && f.canMate && (f.age || 0) >= (adultAtOf(f.s) !== undefined ? adultAtOf(f.s) : lifeOf(f.s) * 0.35));
      for (let a = 0; a < el.length; a++) {
        for (let b = a + 1; b < el.length; b++) {
          const A = el[a], B = el[b];
          if (A.s !== B.s || A.mated || B.mated) continue;
          const dx = A.x - B.x, dy = A.y - B.y;
          if (dx * dx + dy * dy > 130 * 130) continue;
          A.mated = true;
          B.mated = true;
          const egg = { s: A.s, egg: true, t: 0, mated: false };
          Game.fish.push(egg);
          Stage.materialize(egg);
          egg.x = (A.x + B.x) / 2;
          egg.y = (A.y + B.y) / 2;
          hatched = true;
        }
      }
    }

    Ambience.update(mdt);
    Stage.update(mdt);
    Stage.clear();
    Ambience.drawBack(Stage.ctx);
    Stage.drawScene();
    Ambience.drawFront(Stage.ctx);

    if (hatched || removed) {
      Panel.refresh();
      saveGame();
    } else {
      Panel.tick();
    }
    Detail.tick();

    saveT += mdt;
    if (saveT >= 5) {
      saveT = 0;
      saveGame();
    }
  };
  requestAnimationFrame(ts => {
    last = ts;
    requestAnimationFrame(loop);
  });

  window.addEventListener('beforeunload', saveGame);
})();
