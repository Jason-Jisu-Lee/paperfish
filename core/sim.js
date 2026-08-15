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
          const n = soulYield();
          Game.souls += n;
          Stage.spawnPop(f.x, f.y, '+' + n, 'soul');
          if (!Game.tuts.saysoul) {
            Game.tuts.saysoul = 1;
            Say.say(WHISPER.soul);
          }
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
          f.pop = 0.3;
          Sfx.evolve();
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
              const aware = f.hstate === 2 || (f.dT !== undefined && f.dT <= 0);
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
