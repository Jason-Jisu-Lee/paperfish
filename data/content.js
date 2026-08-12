const OBJECTIVES = [
  { id: 'buyfish', text: 'Buy a fish', reward: 5 },
  { id: 'buykelp', text: 'Buy a kelp', reward: 5 },
  { id: 'lantern', text: 'Collect gold from Paper Lanterns', reward: 5, target: 3 },
  { id: 'learnfish', text: 'Learn about the fish by clicking on it', reward: 5, side: true },
  { id: 'income', text: 'Buy firstF Income upgrade', reward: 5 },
  { id: 'five', text: 'Have a total of 5 firstF', reward: 50, target: 5, sp: 0 },
  { id: 'twenty', text: 'Have the maximum of 20 firstF', reward: 1000, target: 20, sp: 0 },
  { id: 'fivesecond', text: 'Have 5 secondF', reward: 10000, target: 5, sp: 1 }
];

const WHISPERS = [
  { id: 'egg', text: 'When will it hatch?' },
  { id: 'kelp', text: 'This should feed the fish.' },
  { id: 'hungry', text: "Fish is hungry! Let's make sure to have enough kelp." },
  { id: 'peaceful', text: "It's peaceful here. I should learn about the fish." },
  { id: 'adult', text: 'The fish got bigger!' }
];

const WHISPER = {};
for (const w of WHISPERS) WHISPER[w.id] = w.text;
