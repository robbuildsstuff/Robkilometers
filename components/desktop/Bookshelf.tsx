'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Book, BookSeries, Bookshelf as Shelf } from '@/content';

// Muted retro spine colours; each book gets one from its id so the shelf looks the same every visit.
const SPINES = [
  { bg: '#b8322a', fg: '#fff4e0' },
  { bg: '#8a1c3a', fg: '#f4e4c4' },
  { bg: '#3e3e44', fg: '#e8c25a' },
  { bg: '#3f7a4a', fg: '#ffffff' },
  { bg: '#e2b33c', fg: '#2a1a0e' },
  { bg: '#eee6cc', fg: '#3a2a1a' },
  { bg: '#8fa6e6', fg: '#1a2a5a' },
  { bg: '#e8574a', fg: '#ffffff' },
  { bg: '#7a4424', fg: '#f4e4c4' },
  { bg: '#24407e', fg: '#ffffff' },
  { bg: '#2a7a78', fg: '#ffffff' },
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function seeded(id: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// One book, as the shelf and the card need it.
type Spine = { id: string; spine: string; title: string; author: string; note?: string; series?: string; vol?: number; colour: (typeof SPINES)[number] };
// What stands in one spot on the shelf: a single book, a box set, or a little pile lying flat.
type Slot = { key: string; kind: 'book' | 'boxset' | 'stack'; spines: Spine[] };

const isSeries = (b: Book | BookSeries): b is BookSeries => 'series' in b;
const colourFor = (id: string) => SPINES[Math.floor(seeded(id, 7) * SPINES.length)];

function spinesFor(b: Book | BookSeries): Spine[] {
  if (isSeries(b)) {
    const colour = colourFor(b.id); // a box set shares one colour
    return b.books.map((v, i) => ({ id: v.id, spine: v.title, title: v.title, author: b.author, note: b.note, series: b.series, vol: i + 1, colour }));
  }
  return [{ id: b.id, spine: b.short ?? b.title, title: b.title, author: b.author, note: b.note, colour: colourFor(b.id) }];
}

// Lay the books out in order. Every so often a few single books lie flat in a pile, like a real shelf.
function slotsFor(read: (Book | BookSeries)[]): Slot[] {
  const slots: Slot[] = [];
  let run = 0;
  for (const b of read) {
    if (isSeries(b)) {
      slots.push({ key: b.id, kind: 'boxset', spines: spinesFor(b) });
      run = 0;
      continue;
    }
    const s = spinesFor(b)[0];
    const last = slots[slots.length - 1];
    if (last?.kind === 'stack' && last.spines.length < 3) last.spines.push(s);
    else if (run === 6) slots.push({ key: `stack-${s.id}`, kind: 'stack', spines: [s] });
    else slots.push({ key: s.id, kind: 'book', spines: [s] });
    run = run === 6 ? -2 : run + 1;
  }
  return slots;
}

// Wider spines for longer titles so they wrap instead of getting cut off.
const widthFor = (s: Spine) => {
  const n = s.spine.length;
  return Math.round((n <= 10 ? 22 : n <= 17 ? 30 : 40) + seeded(s.id, 1) * 6);
};

function SpineButton({ s, open, onOpen, inBox }: { s: Spine; open: boolean; onOpen: () => void; inBox: boolean }) {
  // a little variety: gold bands, a paper label, a coloured cap; a few lean on their neighbour
  const look = inBox ? 'bands' : (['bands', 'label', 'cap', 'bands'] as const)[Math.floor(seeded(s.id, 4) * 4)];
  const lean = !inBox && seeded(s.id, 5) < 0.14;
  const height = inBox ? 98 : Math.round(80 + seeded(s.id, 2) * 26);
  return (
    <button
      type="button"
      className={`spine look-${look}${open ? ' out' : ''}${lean ? ' lean' : ''}`}
      style={{ width: widthFor(s), height, background: s.colour.bg, color: s.colour.fg }}
      onClick={onOpen}
      title={`${s.title} by ${s.author}`}
    >
      {s.vol && <span className="spine-vol">{ROMAN[s.vol - 1] ?? s.vol}</span>}
      <span className="spine-title">{s.spine}</span>
    </button>
  );
}

function FlatBook({ s, i, open, onOpen }: { s: Spine; i: number; open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={`flatbook${open ? ' out' : ''}`}
      style={{
        width: Math.round(Math.min(150, Math.max(96, s.spine.length * 6.4 + 26))),
        background: s.colour.bg,
        color: s.colour.fg,
        marginLeft: i % 2 ? 8 : 0,
      }}
      onClick={onOpen}
      title={`${s.title} by ${s.author}`}
    >
      <span>{s.spine}</span>
    </button>
  );
}

export default function Bookshelf({ shelf, pick, onPick }: { shelf: Shelf; pick?: string; onPick: (id: string | null) => void }) {
  const reading = shelf.reading.flatMap(spinesFor);
  const slots = slotsFor(shelf.read);
  const all = [...reading, ...slots.flatMap((g) => g.spines)];
  const findBook = (id?: string) => all.find((s) => s.id === id) ?? slots.find((g) => g.key === id)?.spines[0];
  const [openId, setOpenId] = useState<string | null>(() => findBook(pick)?.id ?? null);
  const open = all.find((s) => s.id === openId);

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, width: 0 });

  // Shrink the whole bookcase to fit the window so there's no scrolling. At smaller scales
  // the shelf is laid out wider (then scaled down), so it still fills the window.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const W = outer.clientWidth;
      const H = outer.clientHeight;
      if (!W || !H) return;
      // the biggest scale where the case still fits top to bottom (binary search)
      const fits = (s: number) => {
        inner.style.width = `${W / s}px`;
        return inner.scrollHeight * s <= H;
      };
      let lo = 0.35;
      let hi = 1;
      if (fits(1)) lo = 1;
      else
        for (let k = 0; k < 12; k++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
      inner.style.width = `${W / lo}px`;
      setFit({ scale: lo, width: W / lo });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  const show = (id: string | null) => {
    setOpenId(id);
    onPick(id);
  };

  // Escape puts the book back.
  useEffect(() => {
    if (!openId) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') show(null);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  return (
    <div className="shelf-wrap" ref={outerRef}>
      <div className="shelf-fit" ref={innerRef} style={{ width: fit.width || undefined, transform: `scale(${fit.scale})` }}>
        <h2 className="shelf-title">{shelf.title}</h2>
        <div className="bookcase">
          <div className="shelf">
            {reading.map((s) => (
              <div key={s.id} className="shelf-item reading">
                <span className="reading-tag">reading now</span>
                <button type="button" className="face-out" onClick={() => show(s.id)} style={{ background: s.colour.bg, color: s.colour.fg }}>
                  <i className="bookmark" />
                  <b>{s.spine}</b>
                  <small>{s.author}</small>
                </button>
              </div>
            ))}
            {slots.map((g) => (
              <div key={g.key} className="shelf-item">
                {g.kind === 'boxset' && (
                  <div className="boxset-case" title={g.spines[0].series}>
                    <div className="boxset-books">
                      {g.spines.map((s) => (
                        <SpineButton key={s.id} s={s} inBox open={s.id === openId} onOpen={() => show(s.id)} />
                      ))}
                    </div>
                    <div className="boxset-base" style={{ background: g.spines[0].colour.bg }} />
                  </div>
                )}
                {g.kind === 'book' && <SpineButton s={g.spines[0]} inBox={false} open={g.spines[0].id === openId} onOpen={() => show(g.spines[0].id)} />}
                {g.kind === 'stack' && (
                  <div className="stack">
                    {g.spines.map((s, i) => (
                      <FlatBook key={s.id} s={s} i={i} open={s.id === openId} onOpen={() => show(s.id)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="book-card-wrap" onClick={() => show(null)}>
          <div className="book-card" style={{ borderColor: open.colour.bg }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={open.title}>
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
