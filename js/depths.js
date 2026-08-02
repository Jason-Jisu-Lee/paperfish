const DEPTHS = [
  null,
  { label: '-200m', gate: 25, carry: 2, snow: 0.15 },
  { label: '-650m', gate: 32, carry: 3, snow: 0.3 },
  { label: '-1300m', gate: 40, carry: 4, snow: 0.5 },
  { label: '-2600m', gate: 48, carry: 5, snow: 0.75 },
  { label: '-4000m', gate: 55, carry: 0, snow: 1 }
];
const poolFor = d => SPECIES.filter(s => s.depth === d);
const poolUpTo = d => SPECIES.filter(s => s.depth <= d);
