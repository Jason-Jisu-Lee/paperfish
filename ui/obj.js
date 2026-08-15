const Obj = (() => {
  const box = document.getElementById('objbox');
  const txt = document.getElementById('obj-text');
  const rewardEl = document.getElementById('obj-reward');
  const prog = document.getElementById('obj-prog');
  const fill = document.getElementById('obj-fill');
  const count = document.getElementById('obj-count');

  const STEPS = OBJECTIVES.filter(o => !o.side).map(o => ({ ...o }));

  let cur = null, transitioning = false;

  const reward = (b, amt) => {
    Game.gold += amt;
    const r = b.getBoundingClientRect();
    Stage.spawnPop(r.left + r.width / 2, r.bottom + 16, '+' + fmtG(amt), 'big');
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
  };

  const completeCur = () => {
    if (!cur || transitioning) return;
    Game.tuts[cur.id] = 1;
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

  const event = id => {
    if (Game.tuts[id]) return;
    if (cur && cur.id === id) {
      completeCur();
    } else {
      Game.tuts[id] = 1;
      const o = OBJECTIVES.find(x => x.id === id);
      if (o) Game.gold += o.reward;
      saveGame();
    }
  };

  const tick = () => {
    if (!Game.started || !cur || transitioning) return;
    if (cur.prog) render();
    if (cur.auto && cur.auto()) completeCur();
  };

  const start = () => {
    transitioning = false;
    showNext();
  };

  return { start, tick, event };
})();
