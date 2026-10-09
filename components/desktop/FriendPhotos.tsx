'use client';

import { useEffect, useRef, useState } from 'react';
import type { Friend } from '@/content';

// A friend's photos: one at a time, with arrows, swipe and the keyboard arrow keys.
export default function FriendPhotos({ friend }: { friend: Friend }) {
  const photos = friend.photos ?? [];
  const n = photos.length;
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const x0 = useRef<number | null>(null);
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  if (!n) return null;
  const p = photos[i];
  return (
    <div
      className="fp"
      ref={ref}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === 'ArrowRight') go(1);
      }}
    >
      <div
        className="fp-stage"
        onPointerDown={(e) => {
          x0.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (x0.current === null) return;
          const dx = e.clientX - x0.current;
          x0.current = null;
          if (dx < -40) go(1);
          else if (dx > 40) go(-1);
        }}
      >
        {n > 1 && (
          <button type="button" className="bevel wd-arrow" onClick={() => go(-1)} aria-label="Previous photo">
            ‹
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- local photo, shown whole */}
        <img src={p.src} alt={p.alt} draggable={false} />
        {n > 1 && (
          <button type="button" className="bevel wd-arrow" onClick={() => go(1)} aria-label="Next photo">
            ›
          </button>
        )}
      </div>
      <div className="fp-foot">
        <small>
          © {friend.name} · {i + 1} / {n}
        </small>
        {friend.instagram && (
          <a href={friend.instagram} target="_blank" rel="noopener noreferrer">
            {friend.name.split(' ')[0]} on Instagram ↗
          </a>
        )}
      </div>
    </div>
  );
}
