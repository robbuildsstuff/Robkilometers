/*
 * robOS content file.
 * Everything on the desktop comes from this one file. To add something,
 * copy an item inside a folder's `items` list and change the words.
 *
 * Item types:
 *   note    { type, id, title, date?, body }                           -> opens in Notepad
 *   recipe  { type, id, title, date?, serves?, time?, ingredients, steps, note?, source? }
 *   link    { type, id, title, date?, url, note? }                     -> little browser window with a "Visit" button
 *   video   { type, id, title, date?, url, note? }                     -> media player. YouTube video links
 *                                                                        play right in the window; anything else links out
 *   list    { type, id, title, date?, rows: [{ name, detail, url? }] } -> a table (books, playlists, etc.)
 *   image   { type, id, title, date?, src, caption? }                  -> photo viewer (src = a file in /public, e.g. "/photos/tourmalet.jpg")
 *
 * `id` makes a deep link: robkilometers.ca/#food.lemon-pasta opens that item directly,
 * robkilometers.ca/#food opens the folder, robkilometers.ca/#about opens the profile.
 * Items marked "(sample ...)" are placeholders to show the layout. Replace them with your own.
 */

export type IconName =
  | 'folder'
  | 'trash'
  | 'computer'
  | 'notepad'
  | 'recipe'
  | 'globe'
  | 'film'
  | 'book'
  | 'image'
  | 'mail'
  | 'camera'
  | 'music'
  | 'km'
  | 'shutdown'
  | 'runner'
  | 'tools';

type ItemBase = { id: string; title: string; date?: string };

export type NoteItem = ItemBase & { type: 'note'; body: string };
export type RecipeItem = ItemBase & {
  type: 'recipe';
  serves?: string;
  time?: string;
  ingredients: string[];
  steps: string[];
  note?: string;
  source?: string;
};
export type LinkItem = ItemBase & { type: 'link'; url: string; note?: string };
export type VideoItem = ItemBase & { type: 'video'; url: string; note?: string };
export type ListItem = ItemBase & { type: 'list'; rows: { name: string; detail: string; url?: string }[] };
export type ImageItem = ItemBase & { type: 'image'; src: string; caption?: string };

export type Item = NoteItem | RecipeItem | LinkItem | VideoItem | ListItem | ImageItem;
export type ItemType = Item['type'];

export type Folder = {
  id: string;
  name: string;
  icon?: IconName;
  blurb?: string;
  items: Item[];
};

export type QuickLink =
  | { label: string; icon: IconName; email: string }
  | { label: string; icon: IconName; url: string };

export type Site = {
  owner: string;
  handle: string;
  location: string;
  coords: string;
  email: string;
  tagline: string;
  taskbar: QuickLink[];
  readme: { title: string; body: string };
  folders: Folder[];
};

export const site: Site = {
  owner: 'Rob Kilometers',
  handle: 'robkilometers',
  location: 'Toronto, ON',
  coords: '43.65°N 79.38°W',
  email: 'hello@robkilometers.ca',
  tagline: "Food, clothes, books, sport and whatever else I'm into this week.",

  // Quick-launch icons on the taskbar. Swap in your real handles.
  taskbar: [
    { label: 'Email me', icon: 'mail', email: 'hello@robkilometers.ca' },
    { label: 'Instagram (add your handle)', icon: 'camera', url: 'https://www.instagram.com/' },
    { label: 'YouTube (add your channel)', icon: 'film', url: 'https://www.youtube.com/' },
    { label: 'Spotify (add a playlist)', icon: 'music', url: 'https://open.spotify.com/' },
  ],

  // Opens automatically on desktop the first time someone visits.
  readme: {
    title: 'README.TXT',
    body: `Welcome to robOS 98.

This is my corner of the internet. It's not a portfolio.
It's food I'm cooking, clothes I like, books I'm reading,
sport I'm watching and whatever I'm thinking about.

Double-click a folder to poke around.
On a phone, just tap.

Start menu, bottom left, has everything in one list.

Last updated: Sept 2026
(sample text, edit me in content.ts)`,
  },

  folders: [
    {
      id: 'food',
      name: 'Food',
      blurb: 'Recipes I actually make, and places and people I learn from.',
      items: [
        {
          type: 'recipe',
          id: 'lemon-pasta',
          title: 'Weeknight Lemon Pasta',
          serves: '2',
          time: '20 min',
          ingredients: [
            '200 g spaghetti',
            '1 lemon, zest and juice',
            '40 g butter',
            '50 g parmesan, finely grated',
            'Black pepper, lots',
            'Handful of basil or parsley',
          ],
          steps: [
            'Cook the pasta in well-salted water until just shy of al dente. Save a mug of the water.',
            'Melt the butter in a wide pan over low heat and add the lemon zest.',
            'Move the pasta into the pan with a splash of pasta water and toss hard.',
            'Off the heat, add the parmesan and lemon juice, tossing until glossy. Loosen with more water if needed.',
            'Finish with pepper and torn herbs. Eat right away.',
          ],
          note: 'Sample recipe. The trick is taking it off the heat before the cheese goes in.',
        },
        {
          type: 'recipe',
          id: 'smash-burger',
          title: 'Smash Burgers',
          serves: '4',
          time: '25 min',
          ingredients: [
            '500 g ground beef (80/20)',
            '4 potato buns',
            '4 slices American cheese',
            '1 onion, sliced paper thin',
            'Pickles, mustard, salt',
          ],
          steps: [
            'Roll the beef into 8 loose balls. Keep them cold.',
            'Get a cast iron pan ripping hot. Toast the buns and set aside.',
            'Put a ball down, top with onion, and smash it flat with a spatula. Salt it.',
            'After about 90 seconds, scrape it up in one go, flip, add cheese, stack a second patty on top.',
            'Build with pickles and mustard.',
          ],
          note: 'Sample recipe.',
        },
        {
          type: 'video',
          id: 'mushroom-pasta',
          title: 'Easy Weeknight Pasta with Mushrooms',
          url: 'https://www.youtube.com/watch?v=dqpOz9pJnho',
          note: 'Sample video: Kenji, point-of-view cooking, no fuss. Plays right here in the window.',
        },
        {
          type: 'link',
          id: 'kenji',
          title: "Kenji's YouTube channel",
          url: 'https://www.youtube.com/@JKenjiLopezAlt',
          note: 'Sample link. Good for learning technique.',
        },
        {
          type: 'link',
          id: 'serious-eats',
          title: 'Serious Eats',
          url: 'https://www.seriouseats.com/',
          note: 'Sample link. Where I go when I want to know why a recipe works.',
        },
        {
          type: 'note',
          id: 'food-list',
          title: 'Places to try in Toronto',
          date: '2026-09-12',
          body: '- that ramen spot on Queen West\n- the Portuguese bakery near Dundas\n- somewhere for proper Sichuan\n\n(sample list)',
        },
      ],
    },
    {
      id: 'clothes',
      name: 'Clothes',
      blurb: 'Stuff I wear, stuff I want, and where I read about it.',
      items: [
        {
          type: 'note',
          id: 'fall-rotation',
          title: 'Fall rotation',
          date: '2026-09-20',
          body: 'Raw denim, grey crewneck, chore coat, beat-up runners.\nThe chore coat does most of the work.\n\n(sample note)',
        },
        {
          type: 'link',
          id: 'heddels',
          title: 'Heddels',
          url: 'https://www.heddels.com/',
          note: 'Sample link. Denim, boots and workwear rabbit hole.',
        },
        {
          type: 'list',
          id: 'wishlist',
          title: 'Wishlist',
          rows: [
            { name: 'Waxed jacket', detail: 'Something that gets better with age (sample)' },
            { name: 'Loafers', detail: 'Brown, not too shiny (sample)' },
            { name: 'Wool overshirt', detail: 'For the in-between weeks (sample)' },
          ],
        },
      ],
    },
    {
      id: 'thoughts',
      name: 'Thoughts',
      blurb: "Short notes. Some of them I'll disagree with next year.",
      items: [
        {
          type: 'note',
          id: 'why-this-site',
          title: 'Why this site',
          date: '2026-09-30',
          body: "I wanted somewhere to put things I like that isn't a feed.\nNo algorithm, no likes. Just folders.\n\n(sample note)",
        },
        {
          type: 'note',
          id: 'on-slow-weekends',
          title: 'On slow weekends',
          date: '2026-09-14',
          body: 'Best weekends have one plan and a lot of room around it.\n\n(sample note)',
        },
      ],
    },
    {
      id: 'books',
      name: 'Books',
      blurb: "What I'm reading and what I'd hand to a friend.",
      items: [
        {
          type: 'list',
          id: 'reading',
          title: 'Reading list',
          rows: [
            { name: 'Kitchen Confidential', detail: 'Anthony Bourdain. Reading now. (sample)' },
            { name: 'Salt, Fat, Acid, Heat', detail: 'Samin Nosrat. Changed how I cook. (sample)' },
            { name: 'The Old Man and the Sea', detail: 'Hemingway. Short, and it hits. (sample)' },
          ],
        },
        {
          type: 'note',
          id: 'underlined',
          title: 'Underlined',
          date: '2026-09-02',
          body: 'Sample: a line from whatever I’m reading goes here, with a sentence on why it stuck.',
        },
      ],
    },
    {
      id: 'sport',
      name: 'Sport',
      blurb: 'Teams, games and the occasional run.',
      items: [
        { type: 'link', id: 'raptors', title: 'Toronto Raptors', url: 'https://www.nba.com/raptors', note: 'Sample link.' },
        { type: 'link', id: 'jays', title: 'Toronto Blue Jays', url: 'https://www.mlb.com/bluejays', note: 'Sample link.' },
      ],
    },
    {
      id: 'running',
      name: 'Running',
      icon: 'runner',
      blurb: 'Kilometers, obviously.',
      items: [
        {
          type: 'note',
          id: 'marathon-block',
          title: 'Marathon block',
          date: '2026-09-28',
          body: 'Marathon — sub-3:30 — Oct 19\n\n[ training log, sub-3:30 push, Oct 19 ]\n\nMon  5.2 km  easy\nWed  8.0 km  waterfront\nSat 12.4 km  long and slow\n\n(sample log)',
        },
        {
          type: 'note',
          id: 'tourmalet',
          title: 'Col du Tourmalet',
          body: '[ the climb story ]',
        },
      ],
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: 'tools',
      blurb: "Things I've built, mostly from zero.",
      items: [
        { type: 'note', id: 'ljud', title: 'Ljud', body: 'AI workout playlist generation. Built from zero, no coding background.' },
        { type: 'note', id: 'bad-form', title: 'Bad Form', body: 'Running & cycling accessories. Score for Cancer campaign.' },
        { type: 'note', id: 'eddie', title: 'Eddie', body: 'Slack-based sales training tool.' },
        { type: 'note', id: 'life-rpg', title: 'Life RPG', body: '[ optional — include or drop ]' },
      ],
    },
    {
      id: 'recycle',
      name: 'Recycle Bin',
      icon: 'trash',
      blurb: 'Takes I no longer stand behind.',
      items: [
        {
          type: 'note',
          id: 'bad-take',
          title: 'pineapple on pizza is wrong.txt',
          date: '2019-06-01',
          body: 'I was young.\n\n(sample note)',
        },
      ],
    },
  ],
};

/*
 * ---------------------------------------------------------------------------
 * Copy from the previous (job-focused) version of the site.
 * Not shown on the desktop any more. Kept here so nothing is lost; the
 * useful bits (projects, running) have been copied into folders above.
 * ---------------------------------------------------------------------------
 */

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
