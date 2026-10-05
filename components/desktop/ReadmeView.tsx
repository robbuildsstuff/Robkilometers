'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { Site } from '@/content';

// The photo is 614 x 942. Its grass runs from below the sky (~9%) to above the man at his desk (~71%),
// so the text is kept between 12% and 68% of the height (scrolling there if it can't fit).
const RATIO = 614 / 942;
const TEXT_TOP = 0.12;
const TEXT_BOTTOM = 0.68;

export default function ReadmeView({ readme }: { readme: Site['readme'] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, font: 15 });

  // Fit the photo in the window at its own shape, then shrink the text until it fits on the grass.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const text = textRef.current;
    if (!outer || !text) return;
    const fit = () => {
      const W = outer.clientWidth;
      const H = outer.clientHeight;
      if (!W || !H) return;
      const w = Math.min(W, H * RATIO);
      const h = w / RATIO;
      const room = h * (TEXT_BOTTOM - TEXT_TOP);
      // shrink to fit, but never below 12px; on small phones the text scrolls on the grass instead
      let font = Math.min(17, Math.max(12, w / 26));
      text.style.fontSize = `${font}px`;
      while (font > 12 && text.scrollHeight > room) {
        font -= 0.5;
        text.style.fontSize = `${font}px`;
      }
      setBox({ w, h, font });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="readme" ref={outerRef}>
      <div
        className="readme-photo"
        style={{ width: box.w || undefined, height: box.h || undefined, backgroundImage: readme.image ? `url(${readme.image})` : undefined }}
      >
        <div
          className="readme-text"
          ref={textRef}
          style={{ top: `${TEXT_TOP * 100}%`, height: `${(TEXT_BOTTOM - TEXT_TOP) * 100}%`, fontSize: box.font }}
        >
          <h2>{readme.heading}</h2>
          {readme.body.split('\n\n').map((para, i) => (
            <p key={i}>
              {para.split('\n').map((l, j) => (
                <span key={j}>
                  {j > 0 && <br />}
                  {l}
                </span>
              ))}
            </p>
          ))}
          {readme.signature ? (
            // eslint-disable-next-line @next/next/no-img-element -- small local graphic
            <img className="readme-signature" src={readme.signature} alt={readme.signoff ?? 'Signature'} />
          ) : (
            readme.signoff && <p className="readme-sign">{readme.signoff}</p>
          )}
        </div>
      </div>
    </div>
  );
}
