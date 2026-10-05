'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Wardrobe as Data, WardrobeCategory } from '@/content';
import { ClothesArt, FitsFrame, Hanger, WantsBook } from './wardrobeArt';

// The wardrobe is drawn at this size, then scaled to fit the window (no scrolling).
const W = 480;
const H = 620;

type View =
  | { kind: 'cat'; id: string; i: number; detail: boolean }
  | { kind: 'fits'; order?: number[] }
  | { kind: 'wants' }
  | { kind: 'inspo' }
  | null;

// A random order for the photo frame, picked when it's opened.
const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, k) => k);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const viewFromPick = (data: Data, pick?: string): View => {
  if (!pick) return null;
  if (pick === 'fits' || pick === 'wants' || pick === 'inspo') return { kind: pick };
  return data.categories.some((c) => c.id === pick) ? { kind: 'cat', id: pick, i: 0, detail: false } : null;
};

function Hero({ cat, onOpen }: { cat: WardrobeCategory; onOpen: () => void }) {
  return (
    <button type="button" className={`wd-hero wd-zone-${cat.zone}`} onClick={onOpen} title={cat.name}>
      {(cat.zone === 'upper' || cat.zone === 'lower') && <Hanger />}
      <ClothesArt art={cat.art} />
      <span className="wd-tag">{cat.name}</span>
    </button>
  );
}

// Swipe left/right on a carousel or the photo frame.
function useSwipe(onLeft: () => void, onRight: () => void) {
  const x0 = useRef<number | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      x0.current = e.clientX;
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (x0.current === null) return;
      const dx = e.clientX - x0.current;
      x0.current = null;
      if (dx < -40) onLeft();
      else if (dx > 40) onRight();
    },
  };
}

function Carousel({ cat, i, detail, go, setDetail, close }: { cat: WardrobeCategory; i: number; detail: boolean; go: (i: number) => void; setDetail: (d: boolean) => void; close: () => void }) {
  const n = cat.items.length;
  const item = cat.items[((i % n) + n) % n];
  const swipe = useSwipe(
    () => go(i + 1),
    () => go(i - 1),
  );
  if (!item) return null;
  return (
    <div className="wd-card" role="dialog" aria-label={cat.name} onClick={(e) => e.stopPropagation()}>
      <div className="wd-card-bar">
        <span>{cat.name}</span>
        <button type="button" className="bevel wd-x" onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      {!detail ? (
        <>
          <div className="wd-carousel" {...swipe}>
            {n > 1 && (
              <button type="button" className="bevel wd-arrow" onClick={() => go(i - 1)} aria-label="Previous">
                ‹
              </button>
            )}
            <button type="button" className="wd-photo" onClick={() => setDetail(true)} title="Where's this from?">
              {/* eslint-disable-next-line @next/next/no-img-element -- local clothing photo */}
              <img src={item.photo} alt={item.name} draggable={false} />
            </button>
            {n > 1 && (
              <button type="button" className="bevel wd-arrow" onClick={() => go(i + 1)} aria-label="Next">
                ›
              </button>
            )}
          </div>
          <div className="wd-caption">
            <b>{item.name}</b>
            {item.brand && <span> · {item.brand}</span>}
            <small>
              {(((i % n) + n) % n) + 1} / {n} · click the photo for details
            </small>
          </div>
        </>
      ) : (
        <div className="wd-detail">
          {/* eslint-disable-next-line @next/next/no-img-element -- local clothing photo */}
          <img src={item.photo} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <dl>
              {item.brand && (
                <>
                  <dt>Brand</dt>
                  <dd>{item.brand}</dd>
                </>
              )}
              {item.boughtAt && (
                <>
                  <dt>Bought at</dt>
                  <dd>{item.boughtAt}</dd>
                </>
              )}
            </dl>
            {item.note && <p className="scribble wd-note">{item.note}</p>}
            {item.url && (
              <a className="bevel btnlink" href={item.url} target="_blank" rel="noopener noreferrer">
                See it ↗
              </a>
            )}
            <button type="button" className="bevel wd-back" onClick={() => setDetail(false)}>
              ‹ Back to {cat.name.toLowerCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// A digital photo frame that shuffles through outfit photos.
function Fits({ fits, order, close }: { fits: Data['fits']; order: number[]; close: () => void }) {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(true);
  const next = () => setK((x) => (x + 1) % order.length);
  const prev = () => setK((x) => (x - 1 + order.length) % order.length);
  const swipe = useSwipe(next, prev);
  useEffect(() => {
    if (!playing || order.length < 2) return;
    const id = setInterval(() => setK((x) => (x + 1) % order.length), 3500);
    return () => clearInterval(id);
  }, [playing, order.length]);
  const fit = fits[order[k]];
  if (!fit) return null;
  return (
    <div className="wd-frame" role="dialog" aria-label="Fits" onClick={(e) => e.stopPropagation()}>
      <div className="wd-frame-top">
        <button type="button" className="wd-frame-btn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <span>FITS · shuffle</span>
        <button type="button" className="wd-frame-btn" onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      <div className="wd-frame-screen" {...swipe}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local outfit photo */}
        <img key={k} src={fit.src} alt={fit.caption ?? 'Outfit'} draggable={false} />
      </div>
      <div className="wd-frame-bottom">
        <span>{fit.caption}</span>
        <button type="button" className="wd-frame-btn" onClick={next} aria-label="Next">
          ›
        </button>
      </div>
    </div>
  );
}

function Wants({ wants, close }: { wants: Data['wants']; close: () => void }) {
  return (
    <div className="wd-wants" role="dialog" aria-label="Wants" onClick={(e) => e.stopPropagation()}>
      <div className="wd-card-bar">
        <span>Wants.txt</span>
        <button type="button" className="bevel wd-x" onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      <div className="notepad">
        <ul className="lines">
          {wants.map((l, i) => {
            const line = typeof l === 'string' ? { text: l } : l;
            return (
              <li key={i}>
                <span className={line.crossed ? 'struck' : undefined}>{line.text}</span>
                {line.scribble && <span className="scribble">{line.scribble}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Rob's Pinterest board, using Pinterest's own board widget, with a plain link as the fallback.
function Inspo({ url, close }: { url: string; close: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    type PinWindow = Window & { PinUtils?: { build: (el?: HTMLElement) => void } };
    const w = window as PinWindow;
    if (w.PinUtils) {
      w.PinUtils.build(boxRef.current ?? undefined);
      return;
    }
    if (!document.querySelector('script[data-pinit]')) {
      const s = document.createElement('script');
      s.src = 'https://assets.pinterest.com/js/pinit.js';
      s.async = true;
      s.dataset.pinit = '1';
      document.body.appendChild(s);
    }
  }, []);
  return (
    <div className="wd-inspo" role="dialog" aria-label="Inspo" onClick={(e) => e.stopPropagation()}>
      <div className="wd-card-bar">
        <span>Inspo</span>
        <button type="button" className="bevel wd-x" onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      <div className="wd-inspo-board" ref={boxRef}>
        <a data-pin-do="embedBoard" data-pin-board-width="400" data-pin-scale-height="260" data-pin-scale-width="80" href={url}>
          Loading the board…
        </a>
      </div>
      <a className="bevel btnlink wd-inspo-open" href={url} target="_blank" rel="noopener noreferrer">
        Open on Pinterest ↗
      </a>
    </div>
  );
}

export default function Wardrobe({ data, pick, onPick }: { data: Data; pick?: string; onPick: (id: string | null) => void }) {
  const [view, setViewState] = useState<View>(() => viewFromPick(data, pick));
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Scale the drawing to fit the window, so there's never any scrolling.
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1.3, el.clientWidth / (W + 16), el.clientHeight / (H + 16)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const setView = (v: View) => {
    setViewState(v);
    onPick(v ? (v.kind === 'cat' ? v.id : v.kind) : null);
  };

  useEffect(() => {
    if (!view) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setView(null);
      if (view.kind === 'cat' && !view.detail && e.key === 'ArrowRight') setViewState({ ...view, i: view.i + 1 });
      if (view.kind === 'cat' && !view.detail && e.key === 'ArrowLeft') setViewState({ ...view, i: view.i - 1 });
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  const zone = (z: WardrobeCategory['zone']) => data.categories.filter((c) => c.zone === z);
  const openCat = (c: WardrobeCategory) => setView({ kind: 'cat', id: c.id, i: 0, detail: false });
  const cat = view?.kind === 'cat' ? data.categories.find((c) => c.id === view.id) : undefined;

  return (
    <div className="wd-wrap" ref={outerRef}>
      <div className="wd-scene" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {/* the open door, with the inspo corkboard pinned inside */}
        <div className="wd-door">
          {data.inspoUrl && (
            <button type="button" className="wd-cork" onClick={() => setView({ kind: 'inspo' })} title="Inspo (Pinterest)">
              <i className="wd-pin" style={{ left: 8 }} />
              <i className="wd-pin" style={{ right: 10, background: '#2a7a78' }} />
              <span className="wd-cork-note">Inspo</span>
              <span className="wd-cork-pic" />
              <span className="wd-cork-pic b" />
            </button>
          )}
        </div>
        <div className="wd-body">
          <div className="wd-shelf">
            <button type="button" className="wd-fits" onClick={() => setView({ kind: 'fits', order: shuffled(data.fits.length) })} title="Fits">
              <FitsFrame />
              <span className="wd-tag">Fits</span>
            </button>
            {zone('shelf').map((c) => (
              <Hero key={c.id} cat={c} onOpen={() => openCat(c)} />
            ))}
            <button type="button" className="wd-wantsbook" onClick={() => setView({ kind: 'wants' })} title="Wants">
              <WantsBook />
              <span className="wd-tag">Wants</span>
            </button>
          </div>
          <div className="wd-rail upper">
            {zone('upper').map((c) => (
              <Hero key={c.id} cat={c} onOpen={() => openCat(c)} />
            ))}
          </div>
          <div className="wd-rail lower">
            {zone('lower').map((c) => (
              <Hero key={c.id} cat={c} onOpen={() => openCat(c)} />
            ))}
          </div>
          <div className="wd-floor">
            {zone('floor').map((c) => (
              <Hero key={c.id} cat={c} onOpen={() => openCat(c)} />
            ))}
          </div>
        </div>
      </div>

      {view && (
        <div className="wd-overlay" onClick={() => setView(null)}>
          {view.kind === 'cat' && cat && (
            <Carousel
              cat={cat}
              i={view.i}
              detail={view.detail}
              go={(i) => setViewState({ ...view, i, detail: false })}
              setDetail={(detail) => setViewState({ ...view, detail })}
              close={() => setView(null)}
            />
          )}
          {view.kind === 'fits' && <Fits fits={data.fits} order={view.order ?? data.fits.map((_, k) => k)} close={() => setView(null)} />}
          {view.kind === 'wants' && <Wants wants={data.wants} close={() => setView(null)} />}
          {view.kind === 'inspo' && data.inspoUrl && <Inspo url={data.inspoUrl} close={() => setView(null)} />}
        </div>
      )}
    </div>
  );
}
