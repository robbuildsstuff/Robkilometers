'use client';

import { useEffect, useRef, useState } from 'react';

// The little runner, two frames of a stride, one letter per pixel ('.' is see-through).
const frames = [
  `
.......hhh......
.......hsss.....
.......sss......
........s.......
.......ggg.s....
......gggggs....
.....sgggg......
....s..ggg......
.......kkk......
......kk.kk.....
.....kk...ks....
....ss.....s....
...oo......oo...
`,
  `
.......hhh......
.......hsss.....
.......sss......
........s.......
.......ggg......
......ggggs.....
......sggg.s....
.......ggg......
.......kkk......
.......kkk......
.......ks.......
.......ss.......
.......oo.......
`,
].map((f) => f.trim().split('\n'));

const colours: Record<string, string> = { h: '#3a2a1a', s: '#e0a878', g: '#1a7a3a', k: '#222', o: '#e9631a' };

const PX = 2; // screen pixels per art pixel for the scenery
const RPX = 3; // ...and for the runner, so he stands out
const HEIGHT = 120;
const RUNNER_H = frames[0].length * RPX;

// The road: a few overlapping waves make gentle ups and downs.
const ground = (x: number) => 84 + 12 * Math.sin(x / 90) + 6 * Math.sin(x / 37 + 1);
const hills = (x: number) => 58 + 14 * Math.sin(x / 160 + 2) + 6 * Math.sin(x / 61);

export default function RunnerBanner({ title, lines: quotes }: { title: string; lines: string[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState(0);

  // Cycle the quotes on a steady cadence.
  useEffect(() => {
    if (quotes.length < 2) return;
    const id = setInterval(() => setQuote((q) => (q + 1) % quotes.length), 2200);
    return () => clearInterval(id);
  }, [quotes.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const g = canvas?.getContext('2d');
    if (!canvas || !wrap || !g) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    const fit = () => {
      width = wrap.clientWidth;
      canvas.width = width;
      canvas.height = HEIGHT;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    let dist = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;

    const draw = (now: number) => {
      const dt = Math.max(0, Math.min(50, now - last));
      last = now;
      const runnerX = Math.round(width * 0.3);
      const slope = ground(dist + runnerX + 4) - ground(dist + runnerX - 4); // > 0 means downhill
      if (!still) dist += dt * (0.07 + slope * 0.02); // slower up the hills

      // sky and sun
      g.fillStyle = '#9fd4ff';
      g.fillRect(0, 0, width, HEIGHT);
      g.fillStyle = '#ffd23a';
      g.fillRect(width - 46, 14, 20, 20);

      // far hills (move slower, for depth), then the road and grass
      for (let x = 0; x < width; x += PX) {
        const hy = Math.round(hills(dist * 0.35 + x) / PX) * PX;
        g.fillStyle = '#7cc05a';
        g.fillRect(x, hy, PX, HEIGHT - hy);
        const gy = Math.round(ground(dist + x) / PX) * PX;
        g.fillStyle = '#555';
        g.fillRect(x, gy, PX, 4);
        g.fillStyle = '#3a8a2a';
        g.fillRect(x, gy + 4, PX, HEIGHT - gy - 4);
      }
      // dashed centre line
      g.fillStyle = '#f2cf5b';
      for (let x = -((dist * 1) % 24); x < width; x += 24) {
        const gy = Math.round(ground(dist + x) / PX) * PX;
        g.fillRect(Math.round(x), gy + 1, 10, 2);
      }

      // runner, feet on the road
      const frame = frames[still ? 0 : Math.abs(Math.floor(dist / 14)) % 2];
      const top = Math.round(ground(dist + runnerX + 12) / PX) * PX - RUNNER_H + RPX;
      frame.forEach((row, y) =>
        [...row].forEach((ch, x) => {
          if (colours[ch]) {
            g.fillStyle = colours[ch];
            g.fillRect(runnerX + x * RPX, top + y * RPX, RPX, RPX);
          }
        }),
      );

      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate(${runnerX + 30}px, ${top - 26}px)`;
      }
      raf = !still && visible ? requestAnimationFrame(draw) : 0;
    };
    raf = requestAnimationFrame(draw);

    // Pause while the window is minimized, scrolled away or otherwise not on screen.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !still) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="runbanner">
      <h2>{title}</h2>
      <div className="runscene" ref={wrapRef}>
        <canvas ref={canvasRef} height={HEIGHT} aria-hidden="true" />
        {quotes.length > 0 && (
          <div className="bubble" ref={bubbleRef} aria-live="off">
            {quotes[quote]}
          </div>
        )}
      </div>
    </div>
  );
}
