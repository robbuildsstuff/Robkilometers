'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { visibleFolders, type Item, type TravelCountry } from '@/content';
import { MAP_LAT_BOTTOM, MAP_LAT_TOP, worldRows } from './worldMap';

const COLS = worldRows[0].length;
const ROWS = worldRows.length;
const COLOURS: Record<string, string> = { '.': '#1f5d7a', l: '#c9bc94', v: '#e2b33c' };
const INKS = ['#1a33a8', '#b8322a', '#2f6e3a', '#6d3a8a', '#1a6a7a', '#8a1c3a', '#3e3e44', '#b0601a'];

type Pin = { key: string; name?: string; country: string; lat: number; lon: number; home?: boolean };

const xPct = (lon: number) => ((lon + 180) / 360) * 100;
const yPct = (lat: number) => ((MAP_LAT_TOP - lat) / (MAP_LAT_TOP - MAP_LAT_BOTTOM)) * 100;

function seeded(id: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// Things elsewhere on the site that mention a city: City Guides, food photos and so on.
type Link = { path: string[]; title: string };
function linksFor(city: string): Link[] {
  const needle = city.toLowerCase();
  const out: Link[] = [];
  const walk = (items: Item[], path: string[]) => {
    for (const it of items) {
      if (it.type === 'folder') {
        walk(it.items, [...path, it.id]);
        continue;
      }
      const text = [it.title, it.type === 'image' ? it.caption : '', it.type === 'map' ? it.area : ''].join(' ').toLowerCase();
      if (text.includes(needle)) out.push({ path: [...path, it.id], title: it.title });
    }
  };
  for (const f of visibleFolders) walk(f.items, [f.id]);
  return out;
}

function Passport({ travel, close }: { travel: TravelCountry[]; close: () => void }) {
  const [page, setPage] = useState(0);
  const per = 6;
  const pages = Math.ceil(travel.length / per);
  const stamps = travel.slice(page * per, page * per + per);
  return (
    <div className="tv-passport" role="dialog" aria-label="Passport" onClick={(e) => e.stopPropagation()}>
      <div className="tv-pass-head">
        <span>PASSPORT · ROB KILOMETERS</span>
        <button type="button" className="bevel wd-x" onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      <div className="tv-pass-page">
        {stamps.map((c, i) => {
          const ink = INKS[Math.floor(seeded(c.country, 3) * INKS.length)];
          const round = seeded(c.country, 4) < 0.45;
          return (
            <div
              key={c.country}
              className={`tv-stamp${round ? ' round' : ''}`}
              style={{ color: ink, borderColor: ink, transform: `rotate(${Math.round((seeded(c.country, 5) - 0.5) * 24)}deg)`, marginTop: i % 2 ? 10 : 0 }}
            >
              <small>✈ ARRIVED</small>
              <b>{c.country.toUpperCase()}</b>
              <small>{c.cities.length ? `${c.cities.length} ${c.cities.length === 1 ? 'city' : 'cities'}` : 'visited'}</small>
            </div>
          );
        })}
      </div>
      <div className="tv-pass-foot">
        <button type="button" className="bevel" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          ‹ Prev
        </button>
        <span>
          page {page + 1} / {pages}
        </span>
        <button type="button" className="bevel" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}>
          Next ›
        </button>
      </div>
    </div>
  );
}

export default function Travel({
  travel,
  pick,
  onPick,
  onOpenPath,
}: {
  travel: TravelCountry[];
  pick?: string;
  onPick: (id: string | null) => void;
  onOpenPath: (path: string[]) => void;
}) {
  const pins: Pin[] = travel.flatMap((c) =>
    c.cities.length
      ? c.cities.map((city) => ({ key: `${c.country}-${city.name}`, name: city.name, country: c.country, lat: city.lat, lon: city.lon, home: city.home }))
      : c.spot
        ? [{ key: c.country, country: c.country, lat: c.spot.lat, lon: c.spot.lon }]
        : [],
  );
  const cityCount = travel.reduce((n, c) => n + c.cities.length, 0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [base, setBase] = useState({ w: 0, h: 0 });
  const [card, setCard] = useState<Pin | null>(null);
  const [passport, setPassport] = useState(pick === 'passport');

  // Paint the pixel map once.
  useEffect(() => {
    const g = canvasRef.current?.getContext('2d');
    if (!g) return;
    worldRows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        g.fillStyle = COLOURS[row[x]];
        g.fillRect(x, y, 1, 1);
      }
    });
  }, []);

  // The map fills the window's width (or height, whichever runs out first).
  useLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const fit = () => {
      const w = Math.min(el.clientWidth, (el.clientHeight * COLS) / ROWS);
      setBase({ w, h: (w * ROWS) / COLS });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampView = (v: { k: number; x: number; y: number }) => {
    const el = viewRef.current;
    if (!el) return v;
    const k = Math.min(6, Math.max(1, v.k));
    const maxX = Math.max(0, (base.w * k - el.clientWidth) / 2 + 20);
    const maxY = Math.max(0, (base.h * k - el.clientHeight) / 2 + 20);
    return { k, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
  };
  // Buttons and the wheel glide to the new zoom; dragging and pinching follow the fingers directly.
  const [smooth, setSmooth] = useState(false);
  const zoom = (f: number, glide = false) => {
    setSmooth(glide);
    setView((v) => clampView({ ...v, k: v.k * f, x: v.x * f, y: v.y * f }));
  };

  // drag to pan, pinch to zoom
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; k: number } | null>(null);
  const moved = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    setSmooth(false);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), k: view.k };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const now = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, now);
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const k = (gesture.current.k * Math.hypot(a.x - b.x, a.y - b.y)) / gesture.current.dist;
      setView((v) => clampView({ ...v, k, x: (v.x * k) / v.k, y: (v.y * k) / v.k }));
      moved.current = true;
    } else if (pointers.current.size === 1) {
      const dx = now.x - prev.x;
      const dy = now.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 1) moved.current = true;
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };

  const showPassport = (on: boolean) => {
    setPassport(on);
    onPick(on ? 'passport' : null);
  };

  return (
    <div className="tv">
      <div className="tv-bar">
        <button type="button" className="bevel" onClick={() => zoom(1.25, true)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="bevel" onClick={() => zoom(1 / 1.25, true)} aria-label="Zoom out">
          –
        </button>
        <button type="button" className="bevel" onClick={() => {
            setSmooth(true);
            setView({ k: 1, x: 0, y: 0 });
          }}>
          Whole world
        </button>
        <span className="tv-hint">drag to move · pinch or +/– to zoom</span>
        <button type="button" className="bevel tv-pass-btn" onClick={() => showPassport(true)}>
          <span className="tv-pass-icon" aria-hidden="true" /> Passport
        </button>
      </div>
      <div
        className="tv-view"
        ref={viewRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // gentle wheel / trackpad zoom: scaled to how far the wheel moved
        onWheel={(e) => zoom(Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.004), true)}
      >
        <div
          className={`tv-stage${smooth ? ' smooth' : ''}`}
          style={{ width: base.w, height: base.h, transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
        >
          <canvas ref={canvasRef} width={COLS} height={ROWS} aria-label="World map of the countries Rob has been to" role="img" />
          {pins.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`tv-pin${p.home ? ' home' : ''}${card?.key === p.key ? ' on' : ''}`}
              style={{ left: `${xPct(p.lon)}%`, top: `${yPct(p.lat)}%`, transform: `translate(-50%, -100%) scale(${1 / view.k})` }}
              title={p.name ? `${p.name}, ${p.country}` : p.country}
              aria-label={p.name ? `${p.name}, ${p.country}` : p.country}
              onClick={() => !moved.current && setCard(p)}
            >
              {p.home ? '⌂' : ''}
            </button>
          ))}
        </div>
        {card && (
          <div className="tv-card" onPointerDown={(e) => e.stopPropagation()}>
            <div className="wd-card-bar">
              <span>{card.home ? 'Home' : 'Been here'}</span>
              <button type="button" className="bevel wd-x" onClick={() => setCard(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="tv-card-body">
              <b>{card.name ?? card.country}</b>
              {card.name && <span>{card.country}</span>}
              {card.name &&
                linksFor(card.name).map((l) => (
                  <button key={l.path.join('.')} type="button" className="tv-link" onClick={() => onOpenPath(l.path)}>
                    → {l.title}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      <div className="status">
        <span>
          {travel.length} countries &amp; territories · {cityCount} cities
        </span>
        <span>robkilometers.ca/#travel</span>
      </div>
      {passport && (
        <div className="wd-overlay" onClick={() => showPassport(false)}>
          <Passport travel={travel} close={() => showPassport(false)} />
        </div>
      )}
    </div>
  );
}
