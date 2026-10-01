'use client';

import { useEffect, useRef, useState } from 'react';

const format = (m: number) => (m < 1000 ? `${Math.floor(m)} m` : `${(m / 1000).toFixed(2)} km`);

// Status-bar counter: how far the visitor has "run" while this window is open and on screen.
// Pauses when the window is minimized or the tab is in the background; starts over when the window closes.
export default function DistanceCounter({ metresPerSecond }: { metresPerSecond: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [metres, setMetres] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let onScreen = true;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      last = performance.now();
    });
    io.observe(el);
    const id = setInterval(() => {
      const now = performance.now();
      if (onScreen && !document.hidden) setMetres((m) => m + ((now - last) / 1000) * metresPerSecond);
      last = now;
    }, 250);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [metresPerSecond]);

  return (
    <span ref={ref} title="How far you've run with me">
      You&apos;ve run {format(metres)}
    </span>
  );
}
