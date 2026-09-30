'use client';

import { useEffect, useRef } from 'react';
import { site, type Folder, type Item } from '@/content';
import { Icon } from './icons';

const avatarRows = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '...hsssssssshh..',
  '...ssesssessh...',
  '...ssssssssss...',
  '...sssssnssss...',
  '....sssmmsss....',
  '.....ssssss.....',
  '......ssss......',
  '...cccccccccc...',
  '..cccccccccccc..',
  '.cccccKcccccccc.',
  '.cccccccccccccc.',
  '.cccccccccccccc.',
];
const avatarColours: Record<string, string> = {
  '.': '#9fd4ff',
  h: '#3a2a1a',
  s: '#e0a878',
  e: '#111',
  n: '#c88a5a',
  m: '#8a3a2a',
  c: '#1a7a3a',
  K: '#fff',
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
  return <canvas ref={ref} className="avatar" width={16} height={16} aria-label="Pixel portrait" role="img" />;
}

const shownFolders = site.folders.filter((f) => f.id !== 'recycle');

const latest = shownFolders
  .flatMap((f) => f.items.map((it) => ({ f, it })))
  .filter((x) => x.it.date)
  .sort((a, b) => (b.it.date ?? '').localeCompare(a.it.date ?? ''))
  .slice(0, 5);

export default function Profile({
  onOpenItem,
  onCopy,
}: {
  onOpenItem: (f: Folder, it: Item) => void;
  onCopy: (text: string) => void;
}) {
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
          <p>
            {site.location}
            <br />
            <span className="term">{site.coords}</span>
          </p>
          <div className="pbox">
            <div>Contacting Rob</div>
            <div className="copyrow">
              <Icon name="mail" className="inline-icon" />
              <code>{site.email}</code>
              <button type="button" className="bevel" style={{ padding: '1px 8px' }} onClick={() => onCopy(site.email)}>
                Copy
              </button>
            </div>
          </div>
          <div className="pbox">
            <div>Rob&apos;s Interests</div>
            <div style={{ padding: 3 }}>
              <table className="ltable">
                <tbody>
                  {shownFolders.map((f) => (
                    <tr key={f.id}>
                      <th>{f.name}</th>
                      <td>{f.blurb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="ext">Rob is in your extended network</div>
          <h3 style={{ marginTop: 18 }}>Rob&apos;s Latest Entries</h3>
          <ul className="entries">
            {latest.map(({ f, it }) => (
              <li key={`${f.id}.${it.id}`}>
                {it.title} (
                <button type="button" onClick={() => onOpenItem(f, it)}>
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
