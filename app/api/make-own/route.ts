import { createHash, timingSafeEqual } from 'node:crypto';

// The "Make Your Own.exe" password check. The password's SHA-256 hash lives in Vercel
// (Settings > Environment Variables > MAKE_OWN_PASSWORD_HASH), never in this public code,
// and the how-to is only sent back once the password matches.
const REPO = 'https://github.com/robbuildsstuff/nookorcranny';

const PROMPT = `I just set up my own Nook or Cranny site (a personal website that looks like a Windows 98 desktop).
Read CLAUDE.md first, it explains how everything works.

Then interview me, a few questions at a time, to make it mine:
- my name, a one-line tagline, my home city
- which folders I want (food, books, travel, music, clothes, sport, whatever I'm into)
- what goes in each one (notes, links, recipes, places, videos, photos, books I've read, countries I've been to)
- my README welcome message
- any friends I want to link to

Suggest ideas based on my answers. Remove the sample content as you replace it.
After each round, update the site, tell me in plain words what changed, and push it live.
Don't make up facts about me: use clear placeholders and tell me what's left to fill in.
Keep going until I say I'm done.`;

const UNLOCKED = {
  pitch: 'Your stuff, your interests, linked together. No feed, no algorithm, no timeline. Just You',
  deploy: `https://vercel.com/new/clone?repository-url=${encodeURIComponent(REPO)}&repository-name=my-nook`,
  steps: [
    'Click Deploy and sign up with GitHub. Pick a name, hit Create, wait a minute.',
    'Open claude.ai/code and pick the new repo it made for you.',
    'Paste the prompt below and answer its questions.',
    'Say "push it live". Your site updates in about a minute.',
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
