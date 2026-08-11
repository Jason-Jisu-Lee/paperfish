const Obj = (() => {
  const box = document.getElementById('objbox');
  const txt = document.getElementById('obj-text');
  const check = document.getElementById('obj-check');
  let current = null, hideTimer = null;

  const show = (id, text) => {
    clearTimeout(hideTimer);
    current = id;
    txt.textContent = text;
    box.classList.remove('done');
    check.setAttribute('hidden', '');
    box.removeAttribute('hidden');
  };

  const update = text => {
    txt.textContent = text;
  };

  const chain = () => {
    if (Game.tuts.lantern && !Game.tuts.buyfish) show('buyfish', 'Buy your first fish');
  };

  const complete = () => {
    current = null;
    box.classList.add('done');
    check.removeAttribute('hidden');
    hideTimer = setTimeout(() => {
      box.setAttribute('hidden', '');
      chain();
    }, 2600);
  };

  const boughtFish = () => {
    if (Game.tuts.buyfish) return;
    Game.tuts.buyfish = 1;
    saveGame();
    if (current === 'buyfish') complete();
  };

  const start = () => {
    clearTimeout(hideTimer);
    current = null;
    box.setAttribute('hidden', '');
    chain();
  };

  return { show, update, complete, boughtFish, start };
})();
