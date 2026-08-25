const Sim = (() => {
  const firstDeath = () => {
    if (Game.tuts.obj1) return;
    Game.tuts.obj1 = 1;
    Obj.start();
    saveGame();
  };

  const deathWhisper = () => {
    if (!Game.tuts.saypaper) {
      Game.tuts.saypaper = 1;
      Say.say(WHISPER.paper);
    } else if (!Game.tuts.sayneed && Game.tuts.prestiged) {
      Game.tuts.sayneed = 1;
      Say.say(WHISPER.need);
    }
  };

  const step = sdt => {
    let refresh = false;
    let earned = 0;
    for (let i = Game.fish.length - 1; i >= 0; i--) {
      const f = Game.fish[i];
      if (f.egg) {
        f.t += sdt;
        if (f.t >= hatchTime()) {
          Stage.hatch(f);
          refresh = true;
        }
      } else if (f.dying !== undefined) {
        f.dying += sdt;
        if (f.dying >= 2.8) {
          Game.fish.splice(i, 1);
          refresh = true;
        }
      } else {
        if (f.birth >= 1 && !Game.tuts.introTut && !Tut.active && !Game.devMode) Tut.intro(f);
        const life = lifeOf();
        f.age = Math.min((f.age || 0) + sdt / 60, life);
        const aAt = adultAtOf();
        if (!f.adult && f.age >= aAt) {
          if (!Game.tuts.sayadult && f.birth >= 1) {
            Game.tuts.sayadult = 1;
            Say.say(WHISPER.adult);
          }
          f.adult = true;
          f.pop = 0.3;
        }
        if (f.eating) {
          f.eating.t -= sdt;
          if (f.eating.t <= 0) {
            f.hunger = Math.min((f.hunger || 0) + f.eating.sat, HUNGER_FULL);
            f.hstate = 0;
            f.hT = 0;
            delete f.eating;
          }
        } else {
          f.hunger = Math.max((f.hunger ?? HUNGER_FULL) - sdt, 0);
          const pct = f.hunger / HUNGER_FULL;
          f.hstate = f.hunger <= Math.min(HUNGER_FULL * STARVE_AT, STARVE_CAP) ? 2 : pct <= HUNGRY_AT ? 1 : 0;
          if (f.hunger <= 0) {
            f.hT = (f.hT || 0) + sdt;
            if (f.hT >= 10) {
              f.nopaper = true;
              f.hstate = 0;
              f.dying = 0;
              firstDeath();
              deathWhisper();
              continue;
            }
          } else {
            f.hT = 0;
          }
          if (f.birth >= 1 && f.hunger <= HUNGER_FULL * EAT_LOCK) {
            const p = Stage.nearestFood(f.x, f.y);
            if (p) {
              const px = p.x + p.hx, pyy = p.y + p.hy;
              if (p.kind) {
                const reach = SPECIES[f.s].len * 0.45;
                const mouth = f.x + f.dir * reach;
                if ((px - mouth) ** 2 + (pyy - f.y) ** 2 < 14 * 14) {
                  Stage.eatPellet(p);
                  f.dir = f.x < px ? 1 : -1;
                  f.eating = { t: 0.8, sat: PELLET_SAT, x: px - f.dir * reach, y: pyy };
                  refresh = true;
                }
              } else if ((px - f.x) ** 2 + (pyy - f.y) ** 2 < 70 * 70) {
                Stage.biteKelp(p);
                if (p.bites <= 0) Game.plants -= 1;
                const side = f.x < px ? -1 : 1;
                f.dir = -side;
                f.eating = { t: 2, sat: KELP_SAT, x: px + side * 13, y: pyy };
                refresh = true;
              }
            }
          }
        }
        if (f.birth >= 1) {
          f.tickT = (f.tickT || 0) + sdt;
          let fired = 0;
          while (f.tickT >= TICK) {
            f.tickT -= TICK;
            fired += 1;
          }
          if (fired) {
            const amt = fishIncome(f.s, f.adult) * fired;
            earned += amt;
            Stage.spawnPop(f.x, f.y - SPECIES[f.s].len * 0.3 - 10, '+' + fmtG(amt) + ' G');
          }
        }
        if (f.age >= life && f.birth >= 1) {
          if (f.deathWait === undefined) {
            f.deathWait = 0.4 + Math.random() * 3;
            f.nopaper = f.hstate >= 2 && !f.eating;
          }
          f.deathWait -= sdt;
          if (f.deathWait <= 0) {
            f.dying = 0;
            firstDeath();
            if (!f.nopaper) {
              const n = paperYieldOf(f.s);
              Game.paper += n;
              Game.paperEarned += n;
              Stage.spawnPop(f.x, f.y - 14, '+' + n, 'paper');
              Obj.event('paper3', n);
            }
            deathWhisper();
          }
        }
      }
    }
    Game.gold += earned;
    return refresh;
  };

  return { step };
})();
