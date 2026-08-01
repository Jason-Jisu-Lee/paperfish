const SPECIES = [
  { id: 'minnow', name: 'minnow', depth: 1, size: 34, asp: 0.364, breed: 14, value: 1, max: 8 },
  { id: 'bass', name: 'bass', depth: 1, size: 52, asp: 0.4, breed: 20, value: 2, max: 5 },
  { id: 'perch', name: 'perch', depth: 1, size: 58, asp: 0.308, breed: 24, value: 3, max: 5 },
  { id: 'cod', name: 'cod', depth: 1, size: 55, asp: 0.4, breed: 26, value: 4, max: 5 },
  { id: 'angelfish', name: 'angelfish', depth: 1, size: 60, asp: 0.935, breed: 30, value: 6, max: 4 },
  { id: 'flounder', name: 'flounder', depth: 1, size: 66, asp: 0.492, breed: 34, value: 8, max: 4 },
  { id: 'trout', name: 'trout', depth: 2, size: 60, asp: 0.328, breed: 30, value: 10, max: 5 },
  { id: 'mackerel', name: 'mackerel', depth: 2, size: 62, asp: 0.299, breed: 32, value: 12, max: 5 },
  { id: 'pike', name: 'pike', depth: 2, size: 78, asp: 0.25, breed: 40, value: 16, max: 4 },
  { id: 'dogfish', name: 'dogfish', depth: 2, size: 72, asp: 0.391, breed: 45, value: 20, max: 3 },
  { id: 'ray', name: 'ray', depth: 2, size: 92, asp: 0.537, breed: 60, value: 26, max: 3 },
  { id: 'shark', name: 'shark', depth: 2, size: 110, asp: 0.414, breed: 70, value: 34, max: 2 },
  { id: 'lantern', name: 'lanternfish', depth: 3, size: 40, asp: 0.385, breed: 40, value: 30, max: 5 },
  { id: 'jelly', name: 'jellyfish', depth: 3, size: 48, asp: 1.098, breed: 35, value: 34, max: 6 },
  { id: 'hatchet', name: 'hatchetfish', depth: 3, size: 46, asp: 0.8, breed: 45, value: 40, max: 4 },
  { id: 'seahorse', name: 'seahorse', depth: 3, size: 36, asp: 1.643, breed: 50, value: 46, max: 4 },
  { id: 'gulper', name: 'gulper eel', depth: 4, size: 88, asp: 0.414, breed: 70, value: 60, max: 3 },
  { id: 'dumbo', name: 'dumbo octopus', depth: 4, size: 54, asp: 1.068, breed: 80, value: 70, max: 3 },
  { id: 'oarfish', name: 'oarfish', depth: 4, size: 150, asp: 0.18, breed: 90, value: 85, max: 2 },
  { id: 'viper', name: 'viperfish', depth: 5, size: 76, asp: 0.303, breed: 90, value: 100, max: 3 },
  { id: 'vampire', name: 'vampire squid', depth: 5, size: 58, asp: 0.682, breed: 100, value: 120, max: 2 },
  { id: 'angler', name: 'anglerfish', depth: 5, size: 64, asp: 0.625, breed: 120, value: 140, max: 2, lamp: { x: 0.116, y: 0.129 } }
];
const SP = {};
SPECIES.forEach(s => { SP[s.id] = s; s.spd = clamp(26 - s.size * 0.055, 14, 26); });
