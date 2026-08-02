const EXTRA_ASSETS = [{ id: 'shadow', size: 160, asp: 54 / 160 }];
const EX = {};
EXTRA_ASSETS.forEach(s => EX[s.id] = s);

function loadRaster(s) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => {
      const w = s.size * 3, h = s.size * 3 * s.asp;
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(w); cv.height = Math.ceil(h);
      cv.getContext('2d').drawImage(im, 0, 0, w, h);
      ASSETS.ras[s.id] = cv;
      res();
    };
    im.onerror = () => res();
    im.src = 'assets/' + s.id + '.svg?v=5';
  });
}

const ASSETS = {
  ras: {},
  load() {
    return Promise.all(SPECIES.concat(EXTRA_ASSETS).map(loadRaster));
  }
};
