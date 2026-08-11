const Say = (() => {
  const box = document.getElementById('saybox');
  const queue = [];
  const last = new Map();
  let showing = false;

  const next = () => {
    if (showing || !queue.length) return;
    showing = true;
    box.textContent = queue.shift();
    box.classList.remove('show');
    void box.offsetWidth;
    box.classList.add('show');
    setTimeout(() => {
      showing = false;
      box.classList.remove('show');
      next();
    }, 4700);
  };

  const say = text => {
    const now = performance.now();
    if (last.has(text) && now - last.get(text) < 15000) return;
    if (queue.includes(text)) return;
    last.set(text, now);
    queue.push(text);
    next();
  };

  return { say };
})();
