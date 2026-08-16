const OBJECTIVES = [
  { id: 'buyegg', text: 'Buy an egg', reward: 5 },
  { id: 'collectsoul', text: 'Collect Soul', reward: 1, soul: true }
];

const WHISPERS = [
  { id: 'soul', text: 'Soul collected' },
  { id: 'adult', text: 'Fish got bigger' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
