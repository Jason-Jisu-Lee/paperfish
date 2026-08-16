const OBJECTIVES = [
  { id: 'buyegg', text: 'Buy an egg', reward: 5 },
  { id: 'collectsoul', text: 'Collect Soul', reward: 1, soul: true, needs: 'soulOpen' }
];

const WHISPERS = [
  { id: 'soul', text: "This fish doesn't live very long" },
  { id: 'need', text: 'Need more soul...' },
  { id: 'adult', text: 'Fish got bigger' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
