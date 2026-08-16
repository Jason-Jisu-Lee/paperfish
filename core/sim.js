const Sim = (() => {
  const firstDeath = () => {
    if (Game.tuts.obj1) return;
    Game.tuts.obj1 = 1;
    Obj.start();
    saveGame();
  };

  const deathWhisper = () => {
    if (!Game.tuts.saysoul) {
      Game.tuts.saysoul = 1;
      Say.say(WHISPER.soul);
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
            f.hstate = 0;
            f.hT = 0;
            f.hungerAt = f.age + HUNGER_AT;
            delete f.eating;
          }
        } else {
          if (!f.hstate && f.age >= (f.hungerAt || HUNGER_AT) && (f.hungerAt || HUNGER_AT) < lifeOf()) {
            f.hstate = 1;
            f.hT = 0;
          }
          if (f.hstate === 1 && lifeOf() > HUNGER_AT && !Game.tuts.hungryTut && !Tut.active) Tut.hungry(f);
          if (f.hstate) {
            f.hT = (f.hT || 0) + sdt;
            if (f.hstate === 1 && f.hT >= 20) {
              f.hstate = 2;
              f.hT = 0;
            } else if (f.hstate === 2 && f.hT >= 10) {
              f.nosoul = true;
              f.hstate = 0;
              f.dying = 0;
              firstDeath();
              deathWhisper();
              continue;
            }
            const aware = f.hstate === 2 || (f.dT !== undefined && f.dT <= 0);
            const p = aware ? Stage.nearestPlant(f.x, f.y) : null;
            if (p) {
              const px = p.x + p.hx, pyy = p.y + p.hy;
              if ((px - f.x) ** 2 + (pyy - f.y) ** 2 < 70 * 70) {
                Stage.biteKelp(p);
                if (p.bites <= 0) Game.plants -= 1;
                const side = f.x < px ? -1 : 1;
                f.dir = -side;
                f.eating = { t: 2, x: px + side * 13, y: pyy };
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
            const amt = incomePer5s() * fired;
            earned += amt;
            Stage.spawnPop(f.x, f.y - SPECIES[f.s].len * 0.3 - 10, '+' + fmtG(amt) + ' G');
          }
        }
        if (f.age >= life && f.birth >= 1) {
          if (f.deathWait === undefined) f.deathWait = 0.4 + Math.random() * 3;
          f.deathWait -= sdt;
          if (f.deathWait <= 0) {
            f.nosoul = f.hstate >= 1 && !f.eating;
            f.dying = 0;
            firstDeath();
            if (!f.nosoul) {
              const n = soulYield();
              Game.souls += n;
              Stage.spawnPop(f.x, f.y - 14, '+' + n, 'soul');
              Obj.event('souls3', n);
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
