
export const SUGGESTIONS = [
  "I'm feeling imposter syndrome at work",
  "I need motivation for my job interview",
  "I'm going through a breakup",
  "I need a good night sleep",
  "I want to feel like the main character",
];

export const LOADING_MESSAGES = [
  "Consulting the stars...",
  "Weaving the threads of thought...",
  "Painting the silence...",
  "Composing the melody...",
  "Breathing life into words...",
];

export const GIFT_MODES = [
  { id: 'encouragement', label: 'Encouragement', icon: '✨', desc: 'Warm, confident, protective' },
  { id: 'mantra', label: 'Daily Mantra', icon: '🧘', desc: 'Rhythmic, grounding, spiritual' },
  { id: 'asmr', label: 'Goodnight', icon: '🌙', desc: 'Soft, intimate, slow whispers' },
] as const;

export type GiftMode = typeof GIFT_MODES[number]['id'];
