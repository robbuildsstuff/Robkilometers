'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import type { Book, BookSeries, Bookshelf as Shelf } from '@/content';

// Retro spine colours; each book gets one from its id so the shelf looks the same every visit.
const SPINES = [
  { bg: '#c8201a', fg: '#fff4e0' },
  { bg: '#1a3a9a', fg: '#ffffff' },
  { bg: '#2a7a78', fg: '#ffffff' },
  { bg: '#e9631a', fg: '#1a1a1a' },
  { bg: '#f2cf5b', fg: '#1a1a1a' },
  { bg: '#3a8a2a', fg: '#ffffff' },
  { bg: '#7a3a9a', fg: '#ffffff' },
  { bg: '#e6d98a', fg: '#3a2a1a' },
  { bg: '#1a1a1a', fg: '#f2cf5b' },
  { bg: '#8a1410', fg: '#f4e4c4' },
  { bg: '#d6e3f5', fg: '#1a3a9a' },
  { bg: '#5f5535', fg: '#ece8dd' },
];

function seeded(id: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// One spine on the shelf, as the card needs it.
type Spine = { id: string; spine: string; title: string; author: string; note?: string; series?: string; vol?: number; colour: (typeof SPINES)[number] };

const isSeries = (b: Book | BookSeries): b is BookSeries => 'series' in b;

function spinesFor(b: Book | BookSeries): Spine[] {
  if (isSeries(b)) {
    // a box set: one colour for the run, a spine per book
    const colour = SPINES[Math.floor(seeded(b.id, 7) * SPINES.length)];
    return b.books.map((v, i) => ({ id: v.id, spine: v.title, title: v.title, author: b.author, note: b.note, series: b.series, vol: i + 1, colour }));
  }
  return [{ id: b.id, spine: b.short ?? b.title, title: b.title, author: b.author, note: b.note, colour: SPINES[Math.floor(seeded(b.id, 7) * SPINES.length)] }];
}

function SpineButton({ s, open, onOpen }: { s: Spine; open: boolean; onOpen: () => void }) {
  // wider spines for longer titles, so the title wraps onto 2 or 3 lines instead of getting cut off
  const n = s.spine.length;
  const width = Math.round((n <= 12 ? 26 : n <= 20 ? 40 : 52) + seeded(s.id, 1) * 8);
  const height = Math.round(110 + seeded(s.id, 2) * 14);
  return (
    <button
      type="button"
      className={`spine${open ? ' out' : ''}`}
      style={{ width, height, background: s.colour.bg, color: s.colour.fg }}
      onClick={onOpen}
      title={`${s.title} by ${s.author}`}
    >
      <span className="spine-title">{s.spine}</span>
      {s.vol && <span className="spine-vol">{s.vol}</span>}
    </button>
  );
}

export default function Bookshelf({
  shelf,
  pick,
  onPick,
}: {
  shelf: Shelf;
  pick?: string;
  onPick: (id: string | null) => void;
}) {
  const reading = shelf.reading.flatMap(spinesFor);
  const groups = shelf.read.map((b) => ({ key: b.id, series: isSeries(b), spines: spinesFor(b) }));
  const all = [...reading, ...groups.flatMap((g) => g.spines)];
  const findBook = (id?: string) => all.find((s) => s.id === id) ?? all.find((s) => s.series && groups.find((g) => g.key === id)?.spines[0].id === s.id);
  const [openId, setOpenId] = useState<string | null>(() => findBook(pick)?.id ?? null);
  const open = all.find((s) => s.id === openId);
  const cardRef = useRef<HTMLDivElement>(null);

  // On a long shelf (phones), bring the card into view wherever you've scrolled to.
  useEffect(() => {
    cardRef.current?.scrollIntoView({ block: 'center' });
  }, [openId]);

  const show = (id: string | null) => {
    setOpenId(id);
    onPick(id);
  };

  return (
    <div className="shelf-wrap">
      <h2 className="shelf-title">{shelf.title}</h2>

      {reading.length > 0 && (
        <div className="reading">
          <span className="reading-label">Currently reading</span>
          <div className="reading-row">
            {reading.map((s) => (
              <Fragment key={s.id}>
                <button type="button" className="face-out" onClick={() => show(s.id)} style={{ background: s.colour.bg, color: s.colour.fg }}>
                  <i className="bookmark" />
                  <b>{s.spine}</b>
                  <small>{s.author}</small>
                </button>
                {s.note && <span className="scribble reading-note">{s.note}</span>}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="shelf">
        {/* every spine stands on its own so long box sets can wrap onto the next shelf on phones */}
        {groups.flatMap((g) =>
          g.spines.map((s, i) => (
            <div
              key={s.id}
              className={`shelf-item${g.series ? ' boxset' : ''}${g.series && i === 0 ? ' box-start' : ''}${g.series && i === g.spines.length - 1 ? ' box-end' : ''}`}
            >
              <SpineButton s={s} open={s.id === openId} onOpen={() => show(s.id)} />
            </div>
          )),
        )}
      </div>

      {open && (
        <div className="book-card-wrap" onClick={() => show(null)}>
          <div ref={cardRef} className="book-card" style={{ borderColor: open.colour.bg }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={open.title}>
            <div className="book-card-band" style={{ background: open.colour.bg, color: open.colour.fg }}>
              {reading.some((r) => r.id === open.id) ? 'Currently reading' : open.series ? `${open.series} · Book ${open.vol}` : 'On the shelf'}
            </div>
            <h3>{open.title}</h3>
            <p className="book-author">by {open.author}</p>
            {open.note && <p className="scribble book-note">“{open.note}”</p>}
            <button type="button" className="bevel book-back" onClick={() => show(null)}>
              Put it back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const bookCount = (shelf: Shelf) => shelf.read.reduce((n, b) => n + (isSeries(b) ? b.books.length : 1), 0) + shelf.reading.length;
