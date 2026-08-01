const DEPTHS = [
  null,
  { label: '-200m', gate: 25, carry: 2, snow: 0.15, sil: 'shark' },
  { label: '-650m', gate: 32, carry: 3, snow: 0.3, sil: 'shark' },
  { label: '-1300m', gate: 40, carry: 4, snow: 0.5, sil: 'oarfish' },
  { label: '-2600m', gate: 48, carry: 5, snow: 0.75, sil: 'oarfish' },
  { label: '-4000m', gate: 55, carry: 0, snow: 1, sil: 'gulper' }
];
const poolFor = d => SPECIES.filter(s => s.depth === d);
const poolUpTo = d => SPECIES.filter(s => s.depth <= d);
