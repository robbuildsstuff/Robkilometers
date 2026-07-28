export const nav = [
  { href: '/work', label: 'Work' },
  { href: '/eat', label: 'Eat' },
  { href: '/build', label: 'Build' },
  { href: '/life', label: 'Life' },
  { href: '/#contact', label: 'Contact' },
];

export const hero = {
  eyebrow: 'Toronto, ON — open to work',
  headlineLines: ['Sells things.', 'Builds things.', 'Runs long distances', 'for no good reason.'],
  sub: 'Founding AE. Looking for the next team worth betting on.',
  tag: 'Marathon — sub-3:30 — Oct 19',
  coords: ['43.65°N, 79.38°W', 'Est. 2026'],
};

export const work = {
  status: 'Open to work',
  metaGrid: [
    { label: 'Status', body: 'Open to work' },
    { label: 'Here for', body: 'Founding / early sales roles, ideally social good or European-standard companies' },
    { label: 'Occupation', body: 'Founding AE. Also: builder, endurance athlete' },
  ],
  roles: [
    {
      when: '2024 – 2026',
      company: 'Clover Labs / RedRover',
      title: 'Founding AE',
      description: null as string | null,
      placeholder: '[ one line on what you closed/built here ]',
    },
    {
      when: '2021 – 2024',
      company: 'Hive.co',
      title: 'Founding AE → Senior Sales Manager',
      description: null as string | null,
      placeholder: '[ one line on the progression ]',
    },
  ],
  whatsNextPlaceholder: "[ one line: what's next ]",
};

export const eat = {
  placeholder: '[ cooking for people — recipes, dinner party stories, whatever this ends up being ]',
};

export const build = {
  projects: [
    { name: 'Ljud', description: 'AI workout playlist generation. Built from zero, no coding background.' },
    { name: 'Bad Form', description: 'Running & cycling accessories. Score for Cancer campaign.' },
    { name: 'Eddie', description: 'Slack-based sales training tool.' },
    { name: 'Life RPG', description: null as string | null, placeholder: '[ optional — include or drop ]' },
  ],
};

export const life = {
  cards: [
    { label: 'Col du Tourmalet', placeholder: '[ the climb story ]' },
    { label: 'Marathon block', placeholder: '[ training log, sub-3:30 push, Oct 19 ]' },
    { label: 'Thoughts', placeholder: "[ travel notes, running club, whatever's on your mind ]" },
  ],
};

export const contact = {
  eyebrow: 'Get in touch',
  email: 'hello@robkilometers.ca',
};

export const footer = {
  copyright: '© 2026 Robkilometers',
};
