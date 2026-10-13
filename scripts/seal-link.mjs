// Locks a link (e.g. a Google Doc) behind the site password, for a recipe's `sourceSealed`.
//   PW='the password' node scripts/seal-link.mjs 'https://docs.google.com/...'
// Paste the printed text into content.ts as sourceSealed: '...'. Only the right password can open it.
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';

const pw = (process.env.PW ?? '').trim().toLowerCase();
const url = process.argv[2];
if (!pw || !url) {
  console.error("Usage: PW='password' node scripts/seal-link.mjs <url>");
  process.exit(1);
}
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(pw, salt, 210000, 32, 'sha256');
const c = createCipheriv('aes-256-gcm', key, iv);
const data = Buffer.concat([c.update(url, 'utf8'), c.final()]);
console.log([salt, iv, c.getAuthTag(), data].map((b) => b.toString('base64url')).join('.'));
