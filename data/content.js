const OBJECTIVES = [
  { id: 'paper3', text: 'Collect 3 Paper Points', reward: 10, count: 3 }
];

const WHISPERS = [
  { id: 'paper', text: "This fish doesn't live very long" },
  { id: 'need', text: 'Need more paper...' },
  { id: 'adult', text: 'Fish got bigger' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
