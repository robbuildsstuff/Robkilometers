'use client';

import { useEffect, useRef, useState } from 'react';
import { site, visibleFolders, type ContentItem, type Friend, type Item } from '@/content';

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

// MySpace-style friends. Friends with photos open them; without a link or photos they show "coming soon".
function FriendSpace({ onOpenFriend }: { onOpenFriend: (f: Friend) => void }) {
  const [soon, setSoon] = useState<string | null>(null);
  const n = site.friends.length;
  return (
    <div className="pbox friends">
      <div>Rob&apos;s Friend Space</div>
      <div>
        <p className="friends-count">
          Rob has <b>{n}</b> {n === 1 ? 'friend' : 'friends'}.
        </p>
        <ul className="friends-grid">
          {site.friends.slice(0, 8).map((f, i) => (
            <li key={i}>
              {f.url ? (
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  <span>{f.name}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- small local picture */}
                  <img src={f.photo} alt={f.name} />
                </a>
              ) : (
                <button type="button" onClick={() => (f.photos?.length ? onOpenFriend(f) : setSoon(soon === f.name + i ? null : f.name + i))}>
                  <span>{f.name}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- small local picture */}
                  <img src={f.photo} alt={f.name} />
                  {soon === f.name + i && <small>coming soon</small>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
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

export default function Profile({ onOpenPath, onOpenFriend }: { onOpenPath: (path: string[]) => void; onOpenFriend: (f: Friend) => void }) {
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
          <FriendSpace onOpenFriend={onOpenFriend} />
          {latest.length > 0 && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
