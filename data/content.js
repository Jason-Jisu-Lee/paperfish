const OBJECTIVES = [
  { id: 'souls3', text: 'Collect 3 Souls', reward: 10, count: 3 }
];

const WHISPERS = [
  { id: 'soul', text: "This fish doesn't live very long" },
  { id: 'need', text: 'Need more soul...' },
  { id: 'adult', text: 'Fish got bigger' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
