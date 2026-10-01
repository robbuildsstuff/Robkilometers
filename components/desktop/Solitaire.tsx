'use client';

import { useEffect, useRef, useState } from 'react';
import { cityArt } from './cityIcons';
import { GridIcon } from './icons';

// Klondike, draw one. Click (or tap) a card to pick it up, then click where it should go.
// Double-click a card to send it to the foundations.

type Card = { id: string; suit: number; rank: number; up: boolean };
type Game = { stock: Card[]; waste: Card[]; found: Card[][]; tab: Card[][]; moves: number };
type Sel = { pile: 'waste' | 'found' | 'tab'; i: number; idx: number } | null;

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const red = (c: Card) => c.suit === 1 || c.suit === 2;

// Card backs: one of Rob's city logos.
const DECKS = [
  'toronto', 'paris', 'ottawa', 'stockholm', 'london', 'montreal', 'boston', 'new-york', 'los-angeles',
  'melbourne', 'mexico-city', 'denver', 'copenhagen', 'gothenburg', 'nashville', 'madrid', 'lisbon',
] as const;
type Deck = (typeof DECKS)[number];
const deckName = (d: Deck) => d.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

function deal(): Game {
  const cards: Card[] = [];
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) cards.push({ id: `${suit}-${rank}`, suit, rank, up: false });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  const tab: Card[][] = [];
  for (let i = 0; i < 7; i++) {
    const col = cards.splice(0, i + 1);
    col[i] = { ...col[i], up: true };
    tab.push(col);
  }
  return { stock: cards, waste: [], found: [[], [], [], []], tab, moves: 0 };
}

const fitsFound = (c: Card, f: Card[]) => (f.length ? f[f.length - 1].suit === c.suit && f[f.length - 1].rank + 1 === c.rank : c.rank === 1);
const fitsTab = (c: Card, col: Card[]) => {
  const top = col[col.length - 1];
  return top ? top.up && red(top) !== red(c) && top.rank === c.rank + 1 : c.rank === 13;
};

// Cards being moved for a selection, or null if the selection isn't valid.
function picked(g: Game, s: NonNullable<Sel>): Card[] | null {
  if (s.pile === 'waste') return g.waste.length ? [g.waste[g.waste.length - 1]] : null;
  if (s.pile === 'found') return g.found[s.i].length ? [g.found[s.i][g.found[s.i].length - 1]] : null;
  const col = g.tab[s.i];
  return col[s.idx]?.up ? col.slice(s.idx) : null;
}

// Moves the selection onto a target pile if the rules allow. Returns the new game, or null.
function move(g: Game, s: NonNullable<Sel>, to: { pile: 'found' | 'tab'; i: number }): Game | null {
  const cards = picked(g, s);
  if (!cards) return null;
  if (to.pile === 'found' && (cards.length !== 1 || !fitsFound(cards[0], g.found[to.i]))) return null;
  if (to.pile === 'tab' && (!fitsTab(cards[0], g.tab[to.i]) || (s.pile === 'tab' && s.i === to.i))) return null;
  const next: Game = { ...g, waste: [...g.waste], found: g.found.map((f) => [...f]), tab: g.tab.map((t) => [...t]), moves: g.moves + 1 };
  if (s.pile === 'waste') next.waste.pop();
  else if (s.pile === 'found') next.found[s.i].pop();
  else {
    next.tab[s.i].splice(s.idx);
    const col = next.tab[s.i];
    if (col.length && !col[col.length - 1].up) col[col.length - 1] = { ...col[col.length - 1], up: true };
  }
  if (to.pile === 'found') next.found[to.i].push(cards[0]);
  else next.tab[to.i].push(...cards);
  return next;
}

function CardFace({ c, back }: { c: Card; back: Deck }) {
  if (!c.up) {
    return (
      <div className="card back">
        <GridIcon grid={cityArt[back]} />
      </div>
    );
  }
  return (
    <div className={`card up${red(c) ? ' red' : ''}`}>
      <span className="cr">
        {RANKS[c.rank]}
        {SUITS[c.suit]}
      </span>
      <span className={`cm${c.rank > 10 ? ' face' : ''}`}>{c.rank > 10 ? RANKS[c.rank] : SUITS[c.suit]}</span>
    </div>
  );
}

export default function Solitaire() {
  const [game, setGame] = useState<Game>(() => ({ stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []], moves: 0 }));
  const [deck, setDeck] = useState<Deck>('toronto');
  const [sel, setSel] = useState<Sel>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTap = useRef<{ id: string; at: number }>({ id: '', at: 0 });
  const won = game.found.every((f) => f.length === 13);

  const newGame = () => {
    setGame(deal());
    setDeck(DECKS[Math.floor(Math.random() * DECKS.length)]);
    setSel(null);
  };

  // Deal after mount so the shuffle doesn't differ between server and browser.
  useEffect(() => {
    const t = setTimeout(newGame, 0);
    return () => clearTimeout(t);
  }, []);

  // The bouncing-cards finale.
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!won || !canvas || !board) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;
    const g = canvas.getContext('2d');
    if (!g) return;
    const cw = board.querySelector<HTMLElement>('.card')?.offsetWidth ?? 56;
    const ch = Math.round(cw * 1.4);
    const order: { c: Card; x: number }[] = [];
    for (let r = 13; r >= 1; r--) for (let f = 0; f < 4; f++) order.push({ c: { id: '', suit: game.found[f][r - 1].suit, rank: r, up: true }, x: 6 + (3 + f) * (cw + 6) });
    let n = 0;
    let cur = { x: 0, y: 6, vx: 0, vy: 0 };
    let raf = 0;
    const launch = () => {
      cur = { x: order[n].x, y: 6, vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 4), vy: -Math.random() * 6 };
    };
    launch();
    const step = () => {
      const { c } = order[n];
      cur.vy += 0.6;
      cur.x += cur.vx;
      cur.y += cur.vy;
      if (cur.y + ch > canvas.height) {
        cur.y = canvas.height - ch;
        cur.vy *= -0.75;
      }
      g.fillStyle = '#fff';
      g.strokeStyle = '#000';
      g.fillRect(cur.x, cur.y, cw, ch);
      g.strokeRect(cur.x + 0.5, cur.y + 0.5, cw - 1, ch - 1);
      g.fillStyle = red(c) ? '#c8201a' : '#111';
      g.font = `bold ${Math.round(cw * 0.3)}px Tahoma, sans-serif`;
      g.fillText(RANKS[c.rank] + SUITS[c.suit], cur.x + 4, cur.y + cw * 0.32);
      if (cur.x < -cw || cur.x > canvas.width) {
        n++;
        if (n >= order.length) return;
        launch();
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [won, game.found]);

  const sendHome = (s: NonNullable<Sel>) => {
    for (let f = 0; f < 4; f++) {
      const next = move(game, s, { pile: 'found', i: f });
      if (next) {
        setGame(next);
        setSel(null);
        return true;
      }
    }
    return false;
  };

  // A click on a card or an empty spot.
  const tap = (here: NonNullable<Sel>, card?: Card) => {
    // double-click / double-tap sends a top card home
    if (card) {
      const now = Date.now();
      const isTop =
        (here.pile === 'tab' && here.idx === game.tab[here.i].length - 1) || here.pile === 'waste' || here.pile === 'found';
      if (lastTap.current.id === card.id && now - lastTap.current.at < 400 && isTop && card.up && here.pile !== 'found') {
        lastTap.current = { id: '', at: 0 };
        if (sendHome(here)) return;
      }
      lastTap.current = { id: card.id, at: now };
    }
    if (sel && (here.pile === 'tab' || here.pile === 'found')) {
      const next = move(game, sel, { pile: here.pile, i: here.i });
      if (next) {
        setGame(next);
        setSel(null);
        return;
      }
    }
    if (card && !card.up && here.pile === 'tab' && here.idx === game.tab[here.i].length - 1) {
      // flip a face-down top card
      const tab = game.tab.map((t) => [...t]);
      tab[here.i][here.idx] = { ...card, up: true };
      setGame({ ...game, tab });
      setSel(null);
      return;
    }
    const isSame = sel && sel.pile === here.pile && sel.i === here.i && sel.idx === here.idx;
    setSel(card?.up && !isSame && picked(game, here) ? here : null);
  };

  const drawStock = () => {
    setSel(null);
    if (game.stock.length) {
      const stock = [...game.stock];
      const c = stock.pop()!;
      setGame({ ...game, stock, waste: [...game.waste, { ...c, up: true }] });
    } else if (game.waste.length) {
      setGame({ ...game, stock: game.waste.map((c) => ({ ...c, up: false })).reverse(), waste: [] });
    }
  };

  const isSel = (pile: string, i: number, idx: number) =>
    !!sel && sel.pile === pile && sel.i === i && (pile === 'tab' ? idx >= sel.idx : true);
  // Card size is CSS (--cw follows the window width), so stacking is in multiples of it.
  const downGap = 0.16;
  const upGap = 0.36;
  const wasteTop = game.waste[game.waste.length - 1];

  return (
    <>
      <div className="menubar sol-bar">
        <button type="button" onClick={newGame}>
          New game
        </button>
        <label>
          Deck:{' '}
          <select value={deck} onChange={(e) => setDeck(e.target.value as Deck)}>
            {DECKS.map((d) => (
              <option key={d} value={d}>
                {deckName(d)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sunken scroll felt" ref={boardRef}>
        <div className="sol-row">
          <button type="button" className="slot" onClick={drawStock} aria-label={game.stock.length ? 'Draw a card' : 'Turn the pile over'}>
            {game.stock.length ? <CardFace c={game.stock[game.stock.length - 1]} back={deck} /> : <span className="redeal">↻</span>}
          </button>
          <div className="slot">
            {wasteTop && (
              <button type="button" className={isSel('waste', 0, 0) ? 'picked' : undefined} onClick={() => tap({ pile: 'waste', i: 0, idx: 0 }, wasteTop)}>
                <CardFace c={wasteTop} back={deck} />
              </button>
            )}
          </div>
          <div />
          {game.found.map((f, i) => (
            <button
              key={i}
              type="button"
              className={`slot found${isSel('found', i, 0) ? ' picked' : ''}`}
              onClick={() => tap({ pile: 'found', i, idx: f.length - 1 }, f[f.length - 1])}
              aria-label="Foundation"
            >
              {f.length ? <CardFace c={f[f.length - 1]} back={deck} /> : <span className="ace">A</span>}
            </button>
          ))}
        </div>
        <div className="sol-tab">
          {game.tab.map((col, i) => {
            let y = 0;
            const tops = col.map((c) => {
              const t = y;
              y += c.up ? upGap : downGap;
              return t;
            });
            return (
              <div key={i} className="col" style={{ height: `calc(var(--cw) * ${(tops[tops.length - 1] ?? 0) + 1.4})` }} onClick={() => !col.length && tap({ pile: 'tab', i, idx: 0 })}>
                {!col.length && <div className="slot" />}
                {col.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={isSel('tab', i, idx) ? 'picked' : undefined}
                    style={{ top: `calc(var(--cw) * ${tops[idx]})` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      tap({ pile: 'tab', i, idx }, c);
                    }}
                  >
                    <CardFace c={c} back={deck} />
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        {won && (
          <>
            <canvas ref={canvasRef} className="sol-win" aria-hidden="true" />
            <button type="button" className="bevel sol-again" onClick={newGame}>
              You won! Deal again
            </button>
          </>
        )}
      </div>
      <div className="status">
        <span>Moves: {game.moves}</span>
        <span>Deck: {deckName(deck)}</span>
      </div>
    </>
  );
}
