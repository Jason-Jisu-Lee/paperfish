const startGame = () => {
  if (Game.started) return;
  const fresh = !loadGame();
  if (fresh) {
    Game.gold = START_GOLD;
    Game.stream = 0;
    Game.plants = 0;
    Game.unlocked = 1;
    Game.fish = [{ s: 0, egg: false, t: 0 }];
  }
  document.getElementById('hud').removeAttribute('hidden');
  document.getElementById('corner').removeAttribute('hidden');
  document.getElementById('goldbox').removeAttribute('hidden');
  Stage.resize();
  Stage.resetPlants();
  Game.fish.forEach((f, i) => Stage.materialize(f, fresh ? i : undefined));
  for (let i = 0; i < Game.plants; i++) Stage.spawnPlant();
  Game.started = true;
  Panel.refresh();
  Lantern.start();
};

(() => {
  let last = 0;
  let saveT = 0;

  const loop = ts => {
    requestAnimationFrame(loop);
    const raw = (ts - last) / 1000;
    last = ts;
    if (!Game.started) return;
    let dt = raw;
    if (!(dt > 0)) dt = 0;
    if (dt > 0.06) dt = 0.06;
    const mdt = Pause.paused || Tut.active ? 0 : dt;
    const sdt = mdt * Game.speed;
    Tut.tick();

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
        if (f.dying >= 0.65 && !f.deathTut) {
          f.deathTut = true;
          Tut.fire('death', { x: f.x, y: f.y });
        }
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
              Tut.fire('hungry', document.querySelector('[data-up="kelp"]'));
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
              const aware = (f.hstate === 2 || (f.dT !== undefined && f.dT <= 0)) && !f.court;
              const p = aware ? Stage.nearestPlant(f.x, f.y) : null;
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
        const r = speciesGpm(f.s, f.age) / 60 * sdt;
        earned += r;
        f.acc = (f.acc || 0) + r;
        f.popT = (f.popT || 0) - mdt;
        if (f.acc >= 1 && f.popT <= 0 && f.birth >= 1) {
          const n = Math.floor(f.acc);
          f.acc -= n;
          f.popT = 0.8;
          Stage.spawnPop(f.x, f.y - SPECIES[f.s].len * 0.3 - 8, '+' + n.toLocaleString('en-US'));
        }
        if (f.adult && f.birth >= 1 && !f.court) {
          if (f.spawnWin === undefined) {
            f.spawnWin = 0;
            f.spawnAt = Math.random() < Game.mating * 0.05 ? Math.random() * 120 : null;
          }
          f.spawnWin += sdt;
          if (f.spawnAt !== null) {
            if (f.spawnWin > 119.9) f.spawnWin = 119.9;
            if (f.spawnWin >= f.spawnAt && f.hstate === 0 && !f.eating) {
              const mate = Stage.pickMate(f);
              if (mate) {
                Stage.court(f, mate);
                f.spawnAt = null;
              }
            }
          } else if (f.spawnWin >= 120) {
            f.spawnWin = undefined;
          }
        }
        if (f.courtDone) {
          delete f.courtDone;
          f.spawned = (f.spawned || 0) + 1;
          const egg = { s: f.s, egg: true, t: 0 };
          Game.fish.push(egg);
          Stage.materialize(egg);
          egg.x = f.courtEgg.x;
          egg.y = f.courtEgg.y;
          delete f.courtEgg;
          hatched = true;
        }
        if (f.age >= life && f.birth >= 1) {
          if (f.deathWait === undefined) f.deathWait = 0.4 + Math.random() * 3;
          f.deathWait -= sdt;
          if (f.deathWait <= 0) f.dying = 0;
        }
      }
    }
    Game.gold += earned;

    Ambience.update(mdt);
    Stage.update(mdt);
    Lantern.update(mdt);
    Stage.clear();
    Ambience.drawBack(Stage.ctx);
    Stage.drawScene();
    Lantern.draw(Stage.ctx);
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
