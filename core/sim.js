const Sim = (() => {
  const step = (sdt, mdt) => {
    let refresh = false;
    let earned = 0;
    for (let i = Game.fish.length - 1; i >= 0; i--) {
      const f = Game.fish[i];
      if (f.egg) {
        f.t += sdt;
        if (f.t >= hatchTime(f.s)) {
          Stage.hatch(f);
          refresh = true;
        }
      } else if (f.dying !== undefined) {
        f.dying += mdt;
        if (f.dying >= 2.8) {
          const pay = ltvOf(f.s) * 0.1;
          Game.gold += pay;
          Stage.spawnPop(f.x, f.y, '+' + fmtG(pay));
          Game.fish.splice(i, 1);
          refresh = true;
        }
      } else {
        const sp = SPECIES[f.s];
        const life = lifeOf(f.s);
        f.age = Math.min((f.age || 0) + sdt / 60, life);
        const aAt = adultAtOf(f.s);
        if (aAt !== undefined && !f.adult && f.age >= aAt) {
          if (!Game.tuts.sayadult && f.birth >= 1) {
            Game.tuts.sayadult = 1;
            Say.say(WHISPER.adult);
          }
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
              if (!Game.plants && !Game.tuts.sayhungry) {
                Game.tuts.sayhungry = 1;
                Say.say(WHISPER.hungry);
              }
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
                  Sfx.eat();
                  if (p.bites <= 0) Game.plants -= 1;
                  const side = f.x < px ? -1 : 1;
                  f.dir = -side;
                  f.eating = { t: 2, x: px + side * 13, y: pyy };
                  refresh = true;
                }
              }
            }
          }
        }
        if (f.birth >= 1) {
          f.tickT = (f.tickT || 0) + sdt;
          const tick = sp.tick || 5;
          let fired = 0;
          while (f.tickT >= tick) {
            f.tickT -= tick;
            fired += 1;
          }
          if (fired) {
            const amt = Math.round(speciesGpm(f.s, f.age) / 60 * tick) * fired;
            if (amt > 0) {
              earned += amt;
              Stage.spawnPop(f.x, f.y - sp.len * 0.3 - 8, '+' + fmtG(amt));
            }
          }
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
          refresh = true;
        }
        if (f.age >= life && f.birth >= 1) {
          if (f.deathWait === undefined) f.deathWait = 0.4 + Math.random() * 3;
          f.deathWait -= sdt;
          if (f.deathWait <= 0) f.dying = 0;
        }
      }
    }
    Game.gold += earned;
    return refresh;
  };

  return { step };
})();
