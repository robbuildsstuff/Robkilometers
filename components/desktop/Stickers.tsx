import type { Sticker } from '@/content';

// A steady pseudo-random number in [0, 1) from a sticker's id, so auto-placed stickers keep their spot.
function seeded(id: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// The collage on the desktop wallpaper. Purely decoration: it never catches clicks.
export default function Stickers({ stickers }: { stickers: Sticker[] }) {
  if (!stickers.length) return null;
  return (
    <div className="stickers" aria-hidden="true">
      {stickers.map((s) => {
        // auto spots stay right of the icon column
        const x = s.x ?? 30 + seeded(s.id, 1) * 64;
        const y = s.y ?? 8 + seeded(s.id, 2) * 80;
        const rotate = s.rotate ?? Math.round((seeded(s.id, 3) - 0.5) * 30);
        return (
          // eslint-disable-next-line @next/next/no-img-element -- plain img keeps any sticker file working
          <img
            key={s.id}
            className="sticker"
            src={s.src}
            alt={s.alt ?? ''}
            style={{ left: `${x}%`, top: `${y}%`, width: s.size ?? 110, ['--rot' as string]: `${rotate}deg` }}
          />
        );
      })}
    </div>
  );
}
