const Obj = (() => {
  const box = document.getElementById('objbox');
  const txt = document.getElementById('obj-text');
  const cnt = document.getElementById('obj-count');
  const rewardEl = document.getElementById('obj-reward');

  let cur = null, transitioning = false;

  const need = o => o.count || 1;
  const got = o => Game.objs[o.id] || 0;

  const showCount = () => {
    if (need(cur) > 1) {
      cnt.textContent = got(cur) + ' / ' + need(cur);
      cnt.removeAttribute('hidden');
    } else cnt.setAttribute('hidden', '');
  };

  const showNext = () => {
    cur = OBJECTIVES.find(o => got(o) < need(o) && (!o.needs || Game.tuts[o.needs])) || null;
    if (!cur) {
      box.setAttribute('hidden', '');
      return;
    }
    txt.textContent = cur.text;
    showCount();
    rewardEl.textContent = '+' + fmtG(cur.reward) + (cur.soul ? ' Soul' : ' G');
    rewardEl.classList.toggle('objsoul', !!cur.soul);
    rewardEl.style.transform = '';
    rewardEl.style.opacity = '';
    box.classList.remove('done', 'fade', 'in');
    void box.offsetWidth;
    box.classList.add('in');
    box.removeAttribute('hidden');
  };

  const fly = soul => {
    const target = document.querySelector(soul ? '.soul' : '.gold');
    if (!target) return;
    const a = rewardEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    rewardEl.style.transform =
      `translate(${b.left + b.width * 0.3 - a.left}px, ${b.top + b.height * 0.5 - a.top}px) scale(1.6)`;
    rewardEl.style.opacity = '0';
  };

  const event = (id, n = 1) => {
    if (!Game.started || transitioning || !cur || cur.id !== id) return false;
    Game.objs[id] = Math.min(got(cur) + n, need(cur));
    if (Game.objs[id] < need(cur)) {
      showCount();
      saveGame();
      return false;
    }
    const o = cur;
    transitioning = true;
    showCount();
    box.classList.remove('in');
    box.classList.add('done');
    setTimeout(() => fly(o.soul), 430);
    setTimeout(() => {
      if (o.soul) Game.souls += o.reward;
      else Game.gold += o.reward;
      saveGame();
    }, 1180);
    setTimeout(() => box.classList.add('fade'), 1400);
    setTimeout(() => {
      box.setAttribute('hidden', '');
      transitioning = false;
      showNext();
    }, 2000);
    return true;
  };

  const start = () => {
    transitioning = false;
    showNext();
  };

  return { start, event, get busy() { return transitioning; } };
})();
