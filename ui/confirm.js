const Confirm = (() => {
  const modal = document.getElementById('confirm');
  const yes = document.getElementById('confirm-yes');
  const no = document.getElementById('confirm-no');
  let onYes = null;

  const close = () => {
    modal.setAttribute('hidden', '');
    onYes = null;
  };

  yes.addEventListener('click', () => {
    const fn = onYes;
    close();
    if (fn) fn();
  });
  no.addEventListener('click', close);
  modal.addEventListener('click', e => {
    if (e.target === modal) close();
  });

  const open = fn => {
    onYes = fn;
    modal.removeAttribute('hidden');
  };

  return { open };
})();
