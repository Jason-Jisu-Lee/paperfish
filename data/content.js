const OBJECTIVES = [
  { id: 'buyegg', text: 'Buy two eggs', reward: 5, count: 2 },
  { id: 'lantern', text: 'Collect gold from Paper Lantern', reward: 3 },
  { id: 'collectsoul', text: 'Collect Soul', reward: 1, soul: true, needs: 'soulOpen' }
];

const WHISPERS = [
  { id: 'soul', text: "This fish doesn't live very long" },
  { id: 'need', text: 'Need more soul...' },
  { id: 'adult', text: 'Fish got bigger' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
