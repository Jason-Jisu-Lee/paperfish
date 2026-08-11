const Obj = (() => {
  const box = document.getElementById('objbox');
  const mark = document.getElementById('obj-mark');
  const txt = document.getElementById('obj-text');
  const prog = document.getElementById('obj-prog');
  const fill = document.getElementById('obj-fill');
  const count = document.getElementById('obj-count');

  const countFirstF = () => Game.fish.filter(f => f.s === 0 && f.dying === undefined).length;

  const STEPS = [
    { id: 'buyfish', text: 'Buy a fish' },
    { id: 'buykelp', text: 'Buy a kelp' },
    {
      id: 'lantern', text: 'Collect gold from Paper Lanterns',
      prog: () => [Lantern.collected, 3],
      onStart: () => Lantern.begin()
    },
    {
      id: 'five', text: 'Have a total of 5 firstF',
      prog: () => [Math.min(countFirstF(), 5), 5],
      auto: () => countFirstF() >= 5
    }
  ];

  let cur = null, transitioning = false;

  const render = () => {
    if (!cur) return;
    txt.textContent = cur.text;
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
    mark.classList.remove('done');
    box.classList.remove('fade');
    render();
    box.removeAttribute('hidden');
    if (cur.onStart) cur.onStart();
  };

  const completeCur = () => {
    if (!cur || transitioning) return;
    Game.tuts[cur.id] = 1;
    saveGame();
    transitioning = true;
    render();
    mark.classList.add('done');
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
