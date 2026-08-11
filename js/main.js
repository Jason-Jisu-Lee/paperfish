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
  Obj.start();
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
    const mdt = Pause.paused ? 0 : dt;
    const sdt = mdt * Game.speed;

    const refresh = Sim.step(sdt, mdt);

    Ambience.update(mdt);
    Stage.update(mdt);
    Lantern.update(mdt);
    Stage.clear();
    Ambience.drawBack(Stage.ctx);
    Stage.drawScene();
    Lantern.draw(Stage.ctx);
    Ambience.drawFront(Stage.ctx);

    if (refresh) {
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
