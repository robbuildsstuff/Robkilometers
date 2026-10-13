'use client';

// One password unlocks everything behind it (Make Your Own and the locked recipe links) for this visit.
export const MAKE_OWN_KEY = 'make-own-unlocked';
export const RECIPES_KEY = 'recipe-sources';

export function readUnlocked<T>(key: string): T | null {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : null;
  } catch {
    return null;
  }
}

const post = async (url: string, password: string) => {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const json = await res.json();
    return json?.ok ? json : null;
  } catch {
    return null;
  }
};

// Checks the password with the server; on success remembers what it unlocked. Returns whether it was right.
export async function unlock(password: string) {
  const [own, recipes] = await Promise.all([post('/api/make-own', password), post('/api/recipe-sources', password)]);
  try {
    if (own) {
      const { ok: _ok, ...rest } = own; // eslint-disable-line @typescript-eslint/no-unused-vars
      sessionStorage.setItem(MAKE_OWN_KEY, JSON.stringify(rest));
    }
    if (recipes) sessionStorage.setItem(RECIPES_KEY, JSON.stringify(recipes.sources));
  } catch {}
  return Boolean(own || recipes);
}
