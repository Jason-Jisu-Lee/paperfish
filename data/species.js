const SPECIES = [
  {
    file: 'paperminnow', name: 'firstF', vb: [340, 200], sw: 6.5, len: 74,
    paths: ['M310 100 Q180 10 30 148', 'M310 100 Q180 190 30 52']
  },
  {
    file: 'perch', name: 'secondF', vb: [170, 64], sw: 4.8, len: 92, swf: 0.78,
    paths: ['M30 32 C64 12 128 10 164 32', 'M30 32 C64 52 128 54 164 32', 'M4 8 L30 32 L4 56 Z', 'M60 16 L74 2 L87 14']
  },
  {
    file: 'pike', name: 'thirdF', vb: [175, 48], sw: 3.7, len: 108,
    paths: ['M29 26 C60 10 132 12 171 28 C132 42 62 40 29 26 Z', 'M4 4 L29 26 L4 46 Z']
  },
  {
    file: 'cod', name: 'fourthF', vb: [150, 82], sw: 4.4, len: 88,
    paths: ['M4 17 L29 42 C56 78 120 76 146 42', 'M4 64 L29 42 C56 6 120 8 146 42', 'M4 17 L4 64']
  },
  {
    file: 'flounder', name: 'fifthF', vb: [150, 100], sw: 4.3, len: 92,
    paths: ['M4 15 L32 50 C50 92 110 90 144 50', 'M4 85 L32 50 C50 8 110 10 144 50', 'M4 15 L4 85']
  },
  {
    file: 'trout', name: 'sixthF', vb: [170, 62], sw: 4.6, len: 88,
    paths: ['M32 36 C64 18 124 16 166 33 C124 50 66 50 32 36 Z', 'M5 14 L32 36 L5 60 Z', 'M64 24 L77 6 L87 19']
  },
  {
    file: 'mackerel', name: 'seventhF', vb: [165, 56], sw: 4.3, len: 92,
    paths: ['M26 34 C56 16 122 14 161 34', 'M26 34 C56 52 122 50 161 34', 'M26 34 C18 30 10 23 4 13 L11 34 L5 55 C10 47 18 39 26 34 Z', 'M82 20 L94 6 L105 18']
  },
  {
    file: 'minnow', name: 'eighthF', vb: [170, 50], sw: 4.6, len: 74,
    paths: ['M30 25 C64 12 128 11 164 25', 'M30 25 C64 38 128 39 164 25', 'M4 10 L30 25 L4 40 Z', 'M74 13 L86 2 L96 12']
  },
  {
    file: 'ray', name: 'ninthF', vb: [200, 140], sw: 3, len: 126,
    paths: ['M2 70 C58 68.5 100 52 112 2 C126 8 150 52 186 64.5 C194 66.8 198.5 68.6 198.5 70 C198.5 71.4 194 73.2 186 75.5 C150 88 126 132 112 138 C100 88 58 71.5 2 70 Z']
  },
  {
    file: 'jelly', name: 'tenthF', vb: [82, 90], sw: 3.2, len: 52,
    paths: ['M6 42 C4 16 22 6 41 6 C60 6 78 16 76 42 C58 34 24 34 6 42 Z', 'M16 41 C13 51 19 60 15 68', 'M30 38 C25 52 34 66 29 84', 'M48 38 C53 54 44 68 50 86', 'M63 41 C67 49 60 59 65 70']
  },
  {
    file: 'seahorse', name: 'eleventhF', vb: [56, 92], sw: 4.3, len: 42, mirror: true,
    paths: ['M8 16 C16 10 28 6 36 10 C46 16 46 30 38 40 C30 50 26 58 30 68 C34 78 44 78 46 70 C48 64 44 60 40 62', 'M8 16 C14 22 22 26 26 34 C30 42 26 52 24 58']
  },
  {
    file: 'angler', name: 'twelfthF', vb: [112, 70], sw: 4.5, len: 96, mirror: true,
    paths: ['M60 14 C84 12 102 26 100 42 C98 56 82 64 62 62 C46 60 32 52 26 42 L8 50 C12 58 24 60 34 58 C42 62 52 63 62 62', 'M14 50 L18 54 L22 48 L27 53', 'M52 15 C42 6 28 2 16 7'],
    dots: [{ cx: 13, cy: 9, r: 5.5 }]
  },
  {
    file: 'paperminnow', name: 'firstF2', vb: [340, 200], sw: 6.5, len: 74, tint: '62,84,110',
    paths: ['M310 100 Q180 10 30 148', 'M310 100 Q180 190 30 52']
  },
  {
    file: 'paperminnow', name: 'firstF3', vb: [340, 200], sw: 6.5, len: 74, tint: '180,58,43',
    paths: ['M310 100 Q180 10 30 148', 'M310 100 Q180 190 30 52']
  },
  {
    file: 'paperminnow', name: 'firstF4', vb: [340, 200], sw: 6.5, len: 74, tint: '138,109,31',
    paths: ['M310 100 Q180 10 30 148', 'M310 100 Q180 190 30 52']
  }
];
