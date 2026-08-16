const Obj = (() => {
  const box = document.getElementById('objbox');
  const txt = document.getElementById('obj-text');
  const rewardEl = document.getElementById('obj-reward');
  const prog = document.getElementById('obj-prog');

  let cur = null, transitioning = false;

  const showNext = () => {
    cur = OBJECTIVES.find(o => !Game.objs[o.id] && (!o.needs || Game.tuts[o.needs])) || null;
    if (!cur) {
      box.setAttribute('hidden', '');
      return;
    }
    txt.textContent = cur.text;
    rewardEl.textContent = '+' + fmtG(cur.reward) + (cur.soul ? ' Soul' : ' G');
    prog.setAttribute('hidden', '');
    box.classList.remove('done', 'fade');
    box.removeAttribute('hidden');
  };

  const event = id => {
    if (!Game.started || transitioning || !cur || cur.id !== id) return false;
    const o = cur;
    Game.objs[id] = 1;
    const r = box.getBoundingClientRect();
    if (o.soul) {
      Game.bank += o.reward;
      Stage.spawnPop(r.left + r.width / 2, r.bottom + 22, '+' + o.reward + ' Soul', 'soul');
    } else {
      Game.gold += o.reward;
      Stage.spawnPop(r.left + r.width / 2, r.bottom + 22, '+' + fmtG(o.reward) + ' G', 'big');
    }
    saveGame();
    transitioning = true;
    box.classList.add('done');
    setTimeout(() => {
      box.classList.add('fade');
      setTimeout(() => {
        box.setAttribute('hidden', '');
        box.classList.remove('done', 'fade');
        transitioning = false;
        showNext();
      }, 650);
    }, 1400);
    return true;
  };

  const start = () => {
    transitioning = false;
    showNext();
  };

  return { start, event };
})();
