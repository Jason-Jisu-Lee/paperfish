const ASSETS = {
  ras: {},
  load() {
    return Promise.all(SPECIES.map(s => new Promise(res => {
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
      im.src = 'assets/' + s.id + '.svg?v=4';
    })));
  }
};
