import { createDecipheriv, createHash, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

// The site password (Make Your Own, locked recipe links). Only its SHA-256 hash is kept,
// in Vercel's MAKE_OWN_PASSWORD_HASH environment variable. Typed passwords are trimmed and lowercased.
export const normalise = (password: unknown) => (typeof password === 'string' ? password.trim().toLowerCase() : '');

export function passwordOk(password: string) {
  const hash = process.env.MAKE_OWN_PASSWORD_HASH?.trim().toLowerCase() ?? '';
  if (!/^[0-9a-f]{64}$/.test(hash)) return false;
  return timingSafeEqual(createHash('sha256').update(password).digest(), Buffer.from(hash, 'hex'));
}

// Opens a link sealed by scripts/seal-link.mjs (AES-256-GCM, key from the password via PBKDF2).
export function unseal(sealed: string, password: string) {
  try {
    const [salt, iv, tag, data] = sealed.split('.').map((s) => Buffer.from(s, 'base64url'));
    const key = pbkdf2Sync(password, salt, 210000, 32, 'sha256');
    const d = createDecipheriv('aes-256-gcm', key, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}
