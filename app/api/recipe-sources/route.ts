import { site, type Item } from '@/content';
import { normalise, passwordOk, unseal } from '../_lib/password';

// Opens the locked "original recipe" links once the password is right: { id: url } for every recipe with one.
export async function POST(request: Request) {
  let password = '';
  try {
    password = normalise((await request.json())?.password);
  } catch {}
  if (!passwordOk(password)) return Response.json({ ok: false }, { status: 401 });

  const sources: Record<string, string> = {};
  const walk = (items: Item[]) => {
    for (const it of items) {
      if (it.type === 'folder') walk(it.items);
      else if (it.type === 'recipe' && it.sourceSealed) {
        const url = unseal(it.sourceSealed, password);
        if (url) sources[it.id] = url;
      }
    }
  };
  for (const f of site.folders) walk(f.items);
  return Response.json({ ok: true, sources });
}
