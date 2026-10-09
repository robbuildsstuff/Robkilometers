'use client';

import { useEffect, useRef, useState } from 'react';
import { visibleFolders, type Item } from '@/content';
import Meditation from './Meditation';

// Page 2: an animated pixel version of the man at his desk in the field.
// Drawn on a small canvas (about 120 pixels tall) and scaled up, so everything stays chunky.
const VH = 120;
const HORIZON = 0.2; // the sky is the top fifth

// Quotes from Thoughts > Quotes drift in on the sky now and then.
function findQuotes(): string[] {
  let body = '';
  const walk = (items: Item[]) => {
    for (const it of items) {
      if (it.type === 'folder') walk(it.items);
      else if (it.type === 'note' && it.id === 'quotes' && it.body) body = it.body;
    }
  };
  for (const f of visibleFolders) walk(f.items);
  return body
    .split('\n\n')
    .map((q) => q.replace(/\n\s*/g, '  '))
    .filter(Boolean);
}

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export default function FieldPage({ active }: { active: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [meditating, setMeditating] = useState(false);

  // the scene
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const g = canvas?.getContext('2d');
    if (!wrap || !canvas || !g || !active) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let VW = 160;
    let last = 0;
    let draw: (now: number) => void = () => {}; // filled in below, once the scene helpers exist
    const ground = document.createElement('canvas');
    const fit = () => {
      VW = Math.max(60, Math.round((VH * wrap.clientWidth) / Math.max(1, wrap.clientHeight)));
      canvas.width = VW;
      canvas.height = VH;
      // paint the still parts once: sky, hill with a speckled grass texture
      ground.width = VW;
      ground.height = VH;
      const gg = ground.getContext('2d')!;
      const sky = Math.round(VH * HORIZON);
      for (let y = 0; y < sky; y++) {
        const t = y / sky;
        gg.fillStyle = `rgb(${Math.round(222 - t * 14)}, ${Math.round(219 - t * 12)}, ${Math.round(201 - t * 14)})`;
        gg.fillRect(0, y, VW, 1);
      }
      for (let y = sky; y < VH; y++) {
        const t = (y - sky) / (VH - sky);
        for (let x = 0; x < VW; x++) {
          const n = rand(x * 31 + y * 17);
          const r = 72 + t * 22 + (n - 0.5) * 18;
          const gr = 112 + t * 22 + (n - 0.5) * 22;
          const b = 52 + t * 8 + (n - 0.5) * 10;
          gg.fillStyle = `rgb(${r | 0}, ${gr | 0}, ${b | 0})`;
          gg.fillRect(x, y, 1, 1);
        }
      }
      // a soft lighter band where the hill meets the sky
      gg.fillStyle = 'rgba(160, 175, 120, 0.35)';
      gg.fillRect(0, sky, VW, 1);
    };
    fit();
    // resizing clears the canvas; with motion off nothing redraws it, so draw a still frame again
    const ro = new ResizeObserver(() => {
      fit();
      if (still) {
        last = 0;
        draw(performance.now());
      }
    });
    ro.observe(wrap);

    const clouds = [0, 1, 2].map((i) => ({ x: rand(i + 3) * 200, y: 3 + i * 6, w: 14 + i * 5, v: 0.6 + i * 0.25 }));
    let bird = { x: -20, y: 10, on: false };
    let raf = 0;
    const t0 = performance.now();

    draw = (now: number) => {
      raf = still ? 0 : requestAnimationFrame(draw);
      if (now - last < 80) return; // ~12 frames a second keeps it pixel-art jerky and cheap
      last = now;
      const t = (now - t0) / 1000;
      const sky = Math.round(VH * HORIZON);
      g.drawImage(ground, 0, 0);

      // clouds drifting
      g.fillStyle = 'rgba(245, 243, 234, 0.85)';
      for (const c of clouds) {
        const x = Math.round(((c.x + t * c.v) % (VW + 40)) - 30);
        g.fillRect(x, c.y, c.w, 2);
        g.fillRect(x + 3, c.y - 1, c.w - 7, 1);
        g.fillRect(x + 2, c.y + 2, c.w - 4, 1);
      }

      // the odd bird
      if (!bird.on && Math.random() < 0.006) bird = { x: -6, y: 4 + Math.round(Math.random() * (sky - 8)), on: true };
      if (bird.on) {
        bird.x += 1;
        const up = Math.floor(t * 6) % 2 === 0;
        g.fillStyle = '#3a3a3a';
        g.fillRect(bird.x, bird.y, 1, 1);
        g.fillRect(bird.x - 1, bird.y + (up ? -1 : 0), 1, 1);
        g.fillRect(bird.x + 1, bird.y + (up ? -1 : 0), 1, 1);
        if (bird.x > VW + 6) bird.on = false;
      }

      // grass swaying in the foreground
      const top = Math.round(VH * 0.55);
      for (let i = 0; i < VW * 3; i++) {
        const x0 = Math.floor(rand(i) * VW);
        const y = top + Math.floor(rand(i + 999) * (VH - top));
        const depth = (y - top) / (VH - top);
        const sway = Math.round(Math.sin(t * 1.6 + x0 * 0.15 + y * 0.05) * (0.4 + depth));
        g.fillStyle = rand(i + 7) < 0.5 ? 'rgba(150, 175, 90, 0.7)' : 'rgba(45, 80, 35, 0.6)';
        g.fillRect(x0 + sway, y, 1, 1 + Math.round(depth * 2));
      }

      // the man at his desk, seen from behind (a little left of centre, near the bottom)
      const cx = Math.round(VW * 0.47);
      const by = Math.round(VH * 0.86);
      const px = (x: number, y: number, w: number, h: number, c: string) => {
        g.fillStyle = c;
        g.fillRect(cx + x, by + y, w, h);
      };
      // shadow
      g.fillStyle = 'rgba(30, 50, 20, 0.35)';
      g.fillRect(cx - 5, by + 1, 22, 2);
      // chair
      px(-4, -7, 1, 8, '#4a2e1a');
      px(3, -7, 1, 8, '#4a2e1a');
      px(-4, -7, 8, 1, '#5a3a20');
      // man
      px(-3, -18, 6, 1, '#2a1a10'); // hair
      px(-3, -17, 6, 3, '#2a1a10');
      px(-2, -14, 4, 1, '#c8986a'); // neck
      px(-4, -13, 8, 6, '#ece4cc'); // shirt
      px(-4, -13, 1, 6, '#d6ccae');
      px(3, -11, 3, 2, '#ece4cc'); // arm reaching to the keyboard
      px(-3, -7, 7, 2, '#2a2a30'); // trousers
      px(3, -5, 2, 5, '#2a2a30');
      // desk
      px(5, -9, 12, 1, '#7a4a2a');
      px(6, -8, 1, 8, '#5a3a20');
      px(15, -8, 1, 8, '#5a3a20');
      // computer
      px(7, -17, 8, 7, '#d8ccaa');
      px(8, -16, 6, 5, '#1a1a1a');
      const glow = 0.75 + Math.sin(t * 9) * 0.08 + (rand(Math.floor(t * 5)) < 0.06 ? -0.25 : 0);
      g.globalAlpha = glow;
      px(8, -16, 6, 5, '#2a7a78'); // a tiny robOS desktop on the screen
      px(8, -12, 6, 1, '#c3c3c3');
      px(9, -15, 1, 1, '#f2cf5b');
      px(9, -13, 1, 1, '#f2cf5b');
      g.globalAlpha = 1;
      px(9, -10, 4, 1, '#c8bc98'); // keyboard
      px(10, -11, 2, 1, '#bcb08a');
    };
    raf = requestAnimationFrame(draw);
    if (still) draw(performance.now() + 100);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  // a quote now and then
  useEffect(() => {
    if (!active) return;
    const quotes = findQuotes();
    if (!quotes.length) return;
    let i = Math.floor(Math.random() * quotes.length);
    const show = () => {
      setQuote(quotes[i % quotes.length]);
      i++;
      setTimeout(() => setQuote(null), 9000);
    };
    const first = setTimeout(show, 4000);
    const id = setInterval(show, 22000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [active]);

  return (
    <div className="field" ref={wrapRef} aria-label="A man at a computer, alone in a big green field">
      <canvas ref={canvasRef} className="field-canvas" />
      <p className={`field-quote${quote ? ' on' : ''}`} aria-live="polite">
        {quote}
      </p>
      <button type="button" className="field-sign" onClick={() => setMeditating(true)} title="Meditate">
        <span>MEDITATE</span>
        <i />
      </button>
      {meditating && <Meditation onClose={() => setMeditating(false)} />}
    </div>
  );
}
