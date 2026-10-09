import { createHash, timingSafeEqual } from 'node:crypto';

// The "Make Your Own.exe" password check. The password's SHA-256 hash lives in Vercel
// (Settings > Environment Variables > MAKE_OWN_PASSWORD_HASH), never in this public code,
// and the how-to is only sent back once the password matches.
const REPO = 'https://github.com/robbuildsstuff/nookorcranny';

const PROMPT = `Hi Claude! I just set up a Nook or Cranny site and this is its project. Please read CLAUDE.md first; it explains how the site works.

A bit about me: I have never built a website and I don't know how any of this works. Hold my hand the whole way: explain things in plain English, one small step at a time, tell me exactly where to click when I need to do something, and check in before moving on. Never ask me to edit code myself. If something goes wrong, fix it and tell me simply what happened.

What I'm making: my own little corner of the internet that looks like an old Windows 98 desktop. Each icon on the desktop is something I'm into. When you click an icon, a window opens with my stuff inside (photos, lists, recipes, links, notes, whatever fits).

The desktop already has three icons: README (a welcome note), My Computer (a bit about me and my friends) and Trash. Leave those.

Let's start small. Help me pick 4 more folders, one for each thing I'm into. There's no right or wrong; it's whatever feels like me. If I'm stuck, here are some ideas to get me going:
- Food: recipes I make, restaurants I love, a grocery list
- Books: a bookshelf of what I'm reading and what I've read
- Travel: a map with pins where I've been
- Music: albums or playlists on repeat
- Sport: running, cycling, climbing, the team I yell at
- Wardrobe: clothes I love and things I want
- Photos: pictures I'm proud of
- Movies & TV: favourites and what's next
- Thoughts: quotes and little notes to self
- Projects: things I'm building or making
- Something weird and specific to me (plants, sneakers, my dog, coffee)

How I'd like to work with you:
1. Ask me a few easy questions at a time: my name, a one-line hello for the README, and which 4 folders I want.
2. For each folder, keep it simple at first. Ask me for 2 or 3 real things to put inside. If I don't have them yet, use clear placeholders and keep a list of what I still need to fill in.
3. Don't invent facts about me.
4. After each round, check that the site still builds, put it live, and tell me in one or two sentences what changed so I can go and look.
5. Then ask what I'd like to change. I might say things like "make the Food folder look like a cookbook" or "I want an icon that's a calculator", and you build it, I look, I give feedback, and we go again.

For any photo I send you: shrink it to about 2000px wide, keep it under 500KB, and remove all hidden location (GPS) and camera data before adding it.

We can always add more later, so let's get the first version live before making it fancy.

Tips for me (please share these with me after the first version is live):
- The more detail I give you, the closer you'll get to what I'm picturing. "Make it nicer" is hard; "make the window green with a pixel cactus in the corner" is easy.
- Screenshots and reference pictures help a lot. I can drop them in the chat.
- If I don't like something, I can just say "undo that".`;

const UNLOCKED = {
  pitch: 'Your stuff, your interests, linked together. No feed, no algorithm, no timeline. Just You',
  deploy: `https://vercel.com/new/clone?repository-url=${encodeURIComponent(REPO)}&repository-name=my-nook`,
  intro: [
    'GitHub stores your site\'s files (like Google Drive for websites).',
    'Vercel puts them on the internet so anyone can visit.',
    'Claude builds and changes your site for you. You just chat.',
  ],
  steps: [
    'Click the Deploy button above, then Continue with GitHub.',
    'No GitHub account? Click Sign up, pick a username, use your email. It\'s free.',
    'Name your site, like jess-nook (lowercase, no spaces). Click Create.',
    'Wait about a minute for the confetti 🎉. Your address is shown, like jess-nook.vercel.app. Save it.',
    'Go to claude.ai/code and sign in (needs a paid Claude plan).',
    'Click Connect to link GitHub, then pick the repository with your site\'s name.',
    'Copy the prompt below, paste it into the chat and press Enter.',
    'Answer Claude\'s questions. It puts changes live as you go; refresh your site to see them.',
  ],
  prompt: PROMPT,
  repo: REPO,
};

const sha = (s: string) => createHash('sha256').update(s).digest();

export async function POST(request: Request) {
  const hash = process.env.MAKE_OWN_PASSWORD_HASH?.trim().toLowerCase() ?? '';
  let password = '';
  try {
    const body = await request.json();
    if (typeof body?.password === 'string') password = body.password;
  } catch {}
  const ok = /^[0-9a-f]{64}$/.test(hash) && timingSafeEqual(sha(password.trim().toLowerCase()), Buffer.from(hash, 'hex'));
  if (!ok) return Response.json({ ok: false }, { status: 401 });
  return Response.json({ ok: true, ...UNLOCKED });
}
