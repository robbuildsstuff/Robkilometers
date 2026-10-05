'use client';

import { useEffect, useRef } from 'react';
import { site, visibleFolders, type ContentItem, type Item } from '@/content';

// Rob as pixel art, 24 x 24, drawn from a photo (but much happier). One letter per pixel.
const avatarRows = [
  '........................',
  '.......hhhhhhhhhh.......',
  '.....hhhHHhhhhHHhhh.....',
  '....hhhhhhHhhhhhHhhh....',
  '...phhHhhhhhHhhhhhhhp...',
  '...phhhhhhhhhhhhhhhhp...',
  '...phhhhhhhhhhhhhhhhp...',
  '...phhhhhhhhhhhhhhhhp...',
  '...phh.hhhhssssss.hhp...',
  '..ppphsBBBssssBBBshppp..',
  '..pPp.ssksssssskss.pPp..',
  '..pPp.sksksSSsksks.pPp..',
  '..pPp.rrsssSSsssrr.pPp..',
  '..pPp.bmbbbbbbbbmb.pPp..',
  '..pPp.bmmmmmmmmmmb.pPp..',
  '..ppp.bbttttttttbb.ppp..',
  '.......bbmmmmmmbb.......',
  '.......bbbmmmmbbb.......',
  '.........bbbbbb.........',
  '.........SSbbSS.........',
  '.cccccccccSSSSccccccccc.',
  '.cccccccccccccccccccccc.',
  '.cccccccccccccccccccccc.',
  '.cccccccccccccccccccccc.',
];
const avatarColours: Record<string, string> = {
  '.': '#e8dcc4', // wall
  h: '#6b4426', // hair
  H: '#9a6a3e', // hair highlights
  s: '#f0c4a8', // skin
  S: '#d9a088', // skin shadow
  k: '#2a1a10', // eyes
  b: '#7a5232', // beard
  B: '#5a3a20', // eyebrows
  m: '#6a1a1a', // mouth
  t: '#ffffff', // teeth
  p: '#1a1a1a', // headphones
  P: '#4a4a4a', // headphone shine
  c: '#141414', // black tee
  r: '#ec9a8a', // cheeks
};

function Avatar() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current?.getContext('2d');
    if (!g) return;
    avatarRows.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        g.fillStyle = avatarColours[ch];
        g.fillRect(x, y, 1, 1);
      }),
    );
  }, []);
  return <canvas ref={ref} className="avatar" width={24} height={24} aria-label="Pixel portrait" role="img" />;
}

const shownFolders = visibleFolders.filter((f) => f.id !== 'recycle');

// Every dated item, however deep in folders, with its path for the deep link.
function flatten(items: Item[], path: string[]): { path: string[]; it: ContentItem }[] {
  return items.flatMap((it) => (it.type === 'folder' ? flatten(it.items, [...path, it.id]) : [{ path: [...path, it.id], it }]));
}

const latest = shownFolders
  .flatMap((f) => flatten(f.items, [f.id]))
  .filter((x) => x.it.date)
  .sort((a, b) => (b.it.date ?? '').localeCompare(a.it.date ?? ''))
  .slice(0, 5);

export default function Profile({ onOpenPath }: { onOpenPath: (path: string[]) => void }) {
  return (
    <div className="sunken scroll space">
      <div className="space-top">
        <span>ROBSPACE</span>
        <span className="srch" aria-hidden="true">
          The Web <span className="sunken" />
        </span>
      </div>
      <div className="space-band">{site.owner}</div>
      <div className="space-cols">
        <div>
          <h3>{site.owner}</h3>
          <Avatar />
          <p>&ldquo;{site.tagline}&rdquo;</p>
        </div>
        <div>
          <div className="ext">Rob is in your extended network</div>
          <h3 style={{ marginTop: 18 }}>Rob&apos;s Latest Entries</h3>
          <ul className="entries">
            {latest.map(({ path, it }) => (
              <li key={path.join('.')}>
                {it.title} (
                <button type="button" onClick={() => onOpenPath(path)}>
                  check it out
                </button>
                )
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
