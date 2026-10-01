'use client';

import { useEffect, useRef, useState } from 'react';
import type { IconName } from '@/content';
import { Icon } from './icons';

// Klondike, draw one. Drag cards where they should go, or click a card and then click its new spot.
// Double-click a card to send it to the foundations.

type Card = { id: string; suit: number; rank: number; up: boolean; back: IconName };
type Game = { stock: Card[]; waste: Card[]; found: Card[][]; tab: Card[][]; moves: number };
type Where = { pile: 'waste' | 'found' | 'tab'; i: number; idx: number };
type Target = { pile: 'found' | 'tab'; i: number };
type Drag = { from: Where; cards: Card[]; x: number; y: number; over: Target | null };

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const red = (c: Card) => c.suit === 1 || c.suit === 2;

// Every face-down card gets a random icon from around the site, so the backs look like a collage.
const BACKS: IconName[] = [
  'toronto', 'paris', 'ottawa', 'stockholm', 'london', 'montreal', 'boston', 'new-york', 'los-angeles',
  'melbourne', 'mexico-city', 'denver', 'copenhagen', 'gothenburg', 'nashville', 'madrid', 'lisbon',
  'cycling', 'runner', 'recipe', 'notepad', 'globe', 'film', 'book', 'image', 'camera', 'music', 'map',
  'folder', 'computer', 'mail', 'km', 'tools', 'weather',
];
const randomBack = () => BACKS[Math.floor(Math.random() * BACKS.length)];

// Stacking offsets, in card widths (card size itself is CSS: --cw follows the window width).
const DOWN_GAP = 0.16;
const UP_GAP = 0.36;

const emptyGame = (): Game => ({ stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []], moves: 0 });

function deal(): Game {
  const cards: Card[] = [];
  for (let suit = 0; suit < 4; suit++)
    for (let rank = 1; rank <= 13; rank++) cards.push({ id: `${suit}-${rank}`, suit, rank, up: false, back: randomBack() });
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

// The cards that would move if you picked up at `w`, or null if you can't pick up there.
function picked(g: Game, w: Where): Card[] | null {
  if (w.pile === 'waste') return g.waste.length ? [g.waste[g.waste.length - 1]] : null;
  if (w.pile === 'found') return g.found[w.i].length ? [g.found[w.i][g.found[w.i].length - 1]] : null;
  const col = g.tab[w.i];
  return col[w.idx]?.up ? col.slice(w.idx) : null;
}

// Moves cards from `from` onto `to` if the rules allow. Returns the new game, or null.
function move(g: Game, from: Where, to: Target): Game | null {
  const cards = picked(g, from);
  if (!cards) return null;
  if (to.pile === 'found' && (cards.length !== 1 || !fitsFound(cards[0], g.found[to.i]))) return null;
  if (to.pile === 'tab' && (!fitsTab(cards[0], g.tab[to.i]) || (from.pile === 'tab' && from.i === to.i))) return null;
  const next: Game = { ...g, waste: [...g.waste], found: g.found.map((f) => [...f]), tab: g.tab.map((t) => [...t]), moves: g.moves + 1 };
  if (from.pile === 'waste') next.waste.pop();
  else if (from.pile === 'found') next.found[from.i].pop();
  else {
    next.tab[from.i].splice(from.idx);
    const col = next.tab[from.i];
    if (col.length && !col[col.length - 1].up) col[col.length - 1] = { ...col[col.length - 1], up: true };
  }
  if (to.pile === 'found') next.found[to.i].push(cards[0]);
  else next.tab[to.i].push(...cards);
  return next;
}

// Which pile is under the pointer, from the data-drop attributes on piles.
function targetAt(x: number, y: number): Target | null {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]');
  if (!el) return null;
  return { pile: el.dataset.drop as 'found' | 'tab', i: Number(el.dataset.i) };
}

function CardFace({ c }: { c: Card }) {
  if (!c.up) {
    return (
      <div className="card back">
        <Icon name={c.back} />
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
  const [game, setGame] = useState<Game>(emptyGame);
  const [sel, setSel] = useState<Where | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTap = useRef<{ id: string; at: number }>({ id: '', at: 0 });
  const press = useRef<{ from: Where; cards: Card[]; x0: number; y0: number; offX: number; offY: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);
  const won = game.found.every((f) => f.length === 13);

  const newGame = () => {
    setGame(deal());
    setSel(null);
    setDrag(null);
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
    for (let r = 13; r >= 1; r--) for (let f = 0; f < 4; f++) order.push({ c: game.found[f][r - 1], x: 6 + (3 + f) * (cw + 6) });
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

  const sendHome = (from: Where) => {
    for (let f = 0; f < 4; f++) {
      const next = move(game, from, { pile: 'found', i: f });
      if (next) {
        setGame(next);
        setSel(null);
        return true;
      }
    }
    return false;
  };

  // ---- drag and drop (pointer events, so mouse and touch both work) ----
  const onPressCard = (e: React.PointerEvent, from: Where) => {
    if (e.button !== 0) return;
    const cards = picked(game, from);
    if (!cards) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    press.current = { from, cards, x0: e.clientX, y0: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, moved: false };
  };

  useEffect(() => {
    const toBoard = (x: number, y: number) => {
      const b = boardRef.current!.getBoundingClientRect();
      return { x: x - b.left + boardRef.current!.scrollLeft, y: y - b.top + boardRef.current!.scrollTop };
    };
    const onMove = (e: PointerEvent) => {
      const p = press.current;
      if (!p || !boardRef.current) return;
      if (!p.moved && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 6) return;
      p.moved = true;
      e.preventDefault();
      const pos = toBoard(e.clientX - p.offX, e.clientY - p.offY);
      setDrag({ from: p.from, cards: p.cards, x: pos.x, y: pos.y, over: targetAt(e.clientX, e.clientY) });
    };
    const onUp = (e: PointerEvent) => {
      const p = press.current;
      press.current = null;
      if (!p?.moved) return;
      swallowClick.current = true; // the click that follows a drag isn't a tap
      setTimeout(() => (swallowClick.current = false), 0);
      const to = targetAt(e.clientX, e.clientY);
      setGame((g) => (to && move(g, p.from, to)) || g);
      setSel(null);
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // ---- clicks / taps ----
  const tap = (here: Where, card?: Card) => {
    if (swallowClick.current) return;
    // double-click / double-tap sends a top card home
    if (card) {
      const now = Date.now();
      const isTop = here.pile !== 'tab' || here.idx === game.tab[here.i].length - 1;
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

  const isSel = (pile: string, i: number, idx: number) => !!sel && sel.pile === pile && sel.i === i && (pile === 'tab' ? idx >= sel.idx : true);
  // Cards being dragged are drawn by the floating stack instead, so their spots go see-through.
  const isDragged = (pile: string, i: number, idx: number) =>
    !!drag && drag.from.pile === pile && drag.from.i === i && (pile === 'tab' ? idx >= drag.from.idx : true);
  const isOver = (pile: string, i: number) => !!drag && drag.over?.pile === pile && drag.over.i === i && !!move(game, drag.from, drag.over);
  const wasteTop = game.waste[game.waste.length - 1];
  const foundShown = (f: Card[], i: number) => (isDragged('found', i, 0) ? f[f.length - 2] : f[f.length - 1]);

  return (
    <>
      <div className="menubar sol-bar">
        <button type="button" onClick={newGame}>
          New game
        </button>
      </div>
      <div className={`sunken scroll felt${drag ? ' dragging' : ''}`} ref={boardRef}>
        <div className="sol-row">
          <button type="button" className="slot" onClick={drawStock} aria-label={game.stock.length ? 'Draw a card' : 'Turn the pile over'}>
            {game.stock.length ? <CardFace c={game.stock[game.stock.length - 1]} /> : <span className="redeal">↻</span>}
          </button>
          <div className="slot">
            {game.waste.length > 1 && isDragged('waste', 0, 0) && <CardFace c={game.waste[game.waste.length - 2]} />}
            {wasteTop && (
              <button
                type="button"
                className={`${isSel('waste', 0, 0) ? 'picked' : ''}${isDragged('waste', 0, 0) ? ' ghosted' : ''}`}
                onPointerDown={(e) => onPressCard(e, { pile: 'waste', i: 0, idx: 0 })}
                onClick={() => tap({ pile: 'waste', i: 0, idx: 0 }, wasteTop)}
              >
                <CardFace c={wasteTop} />
              </button>
            )}
          </div>
          <div />
          {game.found.map((f, i) => {
            const shown = foundShown(f, i);
            return (
              <button
                key={i}
                type="button"
                data-drop="found"
                data-i={i}
                className={`slot found${isSel('found', i, 0) ? ' picked' : ''}${isOver('found', i) ? ' over' : ''}`}
                onPointerDown={(e) => f.length && onPressCard(e, { pile: 'found', i, idx: f.length - 1 })}
                onClick={() => tap({ pile: 'found', i, idx: f.length - 1 }, f[f.length - 1])}
                aria-label="Foundation"
              >
                {shown ? <CardFace c={shown} /> : <span className="ace">A</span>}
              </button>
            );
          })}
        </div>
        <div className="sol-tab">
          {game.tab.map((col, i) => {
            let y = 0;
            const tops = col.map((c) => {
              const t = y;
              y += c.up ? UP_GAP : DOWN_GAP;
              return t;
            });
            return (
              <div
                key={i}
                data-drop="tab"
                data-i={i}
                className={`col${isOver('tab', i) ? ' over' : ''}`}
                style={{ height: `calc(var(--cw) * ${(tops[tops.length - 1] ?? 0) + 1.4})` }}
                onClick={() => !col.length && tap({ pile: 'tab', i, idx: 0 })}
              >
                {!col.length && <div className="slot" />}
                {col.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${isSel('tab', i, idx) ? 'picked' : ''}${isDragged('tab', i, idx) ? ' ghosted' : ''}`}
                    style={{ top: `calc(var(--cw) * ${tops[idx]})` }}
                    onPointerDown={(e) => c.up && onPressCard(e, { pile: 'tab', i, idx })}
                    onClick={(e) => {
                      e.stopPropagation();
                      tap({ pile: 'tab', i, idx }, c);
                    }}
                  >
                    <CardFace c={c} />
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        {drag && (
          <div className="drag-stack" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
            {drag.cards.map((c, k) => (
              <div key={c.id} style={{ top: `calc(var(--cw) * ${k * UP_GAP})` }}>
                <CardFace c={c} />
              </div>
            ))}
          </div>
        )}
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
        <span>Drag cards, or click then click</span>
      </div>
    </>
  );
}
