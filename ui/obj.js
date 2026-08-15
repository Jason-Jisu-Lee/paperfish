const Obj = (() => {
  const box = document.getElementById('objbox');
  const box2 = document.getElementById('objbox2');
  const txt = document.getElementById('obj-text');
  const rewardEl = document.getElementById('obj-reward');
  const txt2 = document.getElementById('obj2-text');
  const foodBtn = document.getElementById('rail-food');
  const prog = document.getElementById('obj-prog');
  const fill = document.getElementById('obj-fill');
  const count = document.getElementById('obj-count');

  const living = s => Game.fish.filter(f => f.s === s && !f.egg && f.dying === undefined).length;

  const STEPS = OBJECTIVES.filter(o => !o.side).map(o => {
    const s = { ...o };
    if (o.id === 'lantern') {
      s.prog = () => [Lantern.collected, o.target];
      s.onStart = () => Lantern.begin();
    } else if (o.sp !== undefined) {
      s.prog = () => [Math.min(living(o.sp), o.target), o.target];
      s.auto = () => living(o.sp) >= o.target;
    }
    return s;
  });

  const LEARN = OBJECTIVES.find(o => o.id === 'learnfish');
  txt2.textContent = LEARN.text;
  txt2.dataset.t = LEARN.text;
  document.getElementById('obj2-reward').textContent = '+' + fmtG(LEARN.reward) + ' G';

  let cur = null, transitioning = false, learnT = null, sayT = null, side = false;

  const reward = (b, amt) => {
    Game.gold += amt;
    const r = b.getBoundingClientRect();
    Stage.spawnPop(r.left + r.width / 2, r.bottom + 16, '+' + fmtG(amt), true);
  };

  const render = () => {
    if (!cur) return;
    txt.textContent = cur.text;
    txt.dataset.t = cur.text;
    rewardEl.textContent = '+' + fmtG(cur.reward) + ' G';
    if (cur.prog) {
      const [n, total] = cur.prog();
      fill.style.width = (n / total * 100) + '%';
      count.textContent = n + ' / ' + total;
      prog.removeAttribute('hidden');
    } else {
      prog.setAttribute('hidden', '');
    }
  };

  const showNext = () => {
    cur = STEPS.find(s => !Game.tuts[s.id]) || null;
    if (!cur) {
      box.setAttribute('hidden', '');
      return;
    }
    box.classList.remove('done', 'fade');
    render();
    box.removeAttribute('hidden');
    if (cur.onStart) cur.onStart();
  };

  const completeCur = () => {
    if (!cur || transitioning) return;
    Game.tuts[cur.id] = 1;
    if (cur.id === 'lantern') learnT = 0;
    reward(box, cur.reward);
    saveGame();
    transitioning = true;
    render();
    box.classList.add('done');
    Sfx.objective();
    setTimeout(() => {
      box.classList.add('fade');
      setTimeout(() => {
        box.setAttribute('hidden', '');
        box.classList.remove('fade');
        transitioning = false;
        showNext();
      }, 650);
    }, 1500);
  };

  const showSide = () => {
    side = true;
    sayT = 0;
    box2.classList.remove('done', 'fade');
    box2.removeAttribute('hidden');
  };

  const completeSide = () => {
    Game.tuts.learnfish = 1;
    side = false;
    sayT = null;
    reward(box2, LEARN.reward);
    saveGame();
    box2.classList.add('done');
    Sfx.objective();
    setTimeout(() => {
      box2.classList.add('fade');
      setTimeout(() => {
        box2.setAttribute('hidden', '');
        box2.classList.remove('done', 'fade');
      }, 650);
    }, 1500);
  };

  const event = id => {
    if (Game.tuts[id]) return;
    if (id === 'learnfish') {
      if (side) return completeSide();
      Game.tuts.learnfish = 1;
      Game.gold += LEARN.reward;
      learnT = null;
      saveGame();
      return;
    }
    if (cur && cur.id === id) {
      completeCur();
    } else {
      Game.tuts[id] = 1;
      const o = OBJECTIVES.find(x => x.id === id);
      if (o) Game.gold += o.reward;
      saveGame();
    }
  };

  const tick = mdt => {
    const kelpPulse = !!(Game.started && cur && !transitioning && cur.id === 'buykelp');
    foodBtn.classList.toggle('pulse', kelpPulse && !foodBtn.classList.contains('on'));
    if (!Game.started) return;
    if (learnT !== null && !side && !Game.tuts.learnfish) {
      learnT += mdt || 0;
      if (learnT >= 10) {
        learnT = null;
        showSide();
      }
    }
    if (sayT !== null) {
      sayT += mdt || 0;
      if (sayT >= 5) {
        sayT = null;
        Say.say(WHISPER.peaceful);
      }
    }
    if (!cur || transitioning) return;
    if (cur.prog) render();
    if (cur.auto && cur.auto()) completeCur();
  };

  const start = () => {
    transitioning = false;
    side = false;
    sayT = null;
    box2.setAttribute('hidden', '');
    learnT = Game.tuts.lantern && !Game.tuts.learnfish ? 0 : null;
    showNext();
  };

  return { start, tick, event };
})();
