const Obj = (() => {
  const box = document.getElementById('objbox');
  const txt = document.getElementById('obj-text');
  const rewardEl = document.getElementById('obj-reward');

  let cur = null, transitioning = false;

  const showNext = () => {
    cur = OBJECTIVES.find(o => !Game.objs[o.id] && (!o.needs || Game.tuts[o.needs])) || null;
    if (!cur) {
      box.setAttribute('hidden', '');
      return;
    }
    txt.textContent = cur.text;
    rewardEl.textContent = '+' + fmtG(cur.reward) + (cur.soul ? ' Soul' : ' G');
    rewardEl.classList.toggle('objsoul', !!cur.soul);
    rewardEl.style.transform = '';
    rewardEl.style.opacity = '';
    box.classList.remove('done', 'fade');
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

  const event = id => {
    if (!Game.started || transitioning || !cur || cur.id !== id) return false;
    const o = cur;
    Game.objs[id] = 1;
    transitioning = true;
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

  return { start, event };
})();
