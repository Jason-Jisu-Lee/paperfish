const OBJECTIVES = [];

const WHISPERS = [
  { id: 'soul', text: 'Soul collected' },
  { id: 'adult', text: 'Fish got bigger' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
