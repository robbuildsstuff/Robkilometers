'use client';

import type { Doodle, Fridge as FridgeData } from '@/content';

// Where doodles go on the doors, as % of the fridge, with a little tilt each. Extra doodles wrap around.
const SPOTS = [
  { left: 14, top: 40, rot: -5 },
  { left: 52, top: 44, rot: 4 },
  { left: 18, top: 64, rot: 3 },
  { left: 50, top: 70, rot: -4 },
  { left: 16, top: 9, rot: 6 },
  { left: 48, top: 12, rot: -3 },
];
const MAGNETS = ['#c8201a', '#1a33a8', '#f2cf5b', '#3a8a2a', '#e9631a', '#7a3a9a'];

// The fridge in the middle of the desktop wallpaper, with Rob's doodles stuck on it.
export default function Fridge({ data, onOpen }: { data: FridgeData; onOpen: (d: Doodle) => void }) {
  return (
    <div className="fridge" aria-label="Fridge door">
      <svg viewBox="0 0 60 100" shapeRendering="crispEdges" aria-hidden="true" className="fridge-art">
        <rect x="3" y="1" width="54" height="96" fill="#1a1a1a" />
        <rect x="4" y="2" width="52" height="94" fill="#f4f4ee" />
        <rect x="52" y="2" width="4" height="94" fill="#d8d8d0" />
        <rect x="4" y="33" width="52" height="2" fill="#1a1a1a" />
        <rect x="4" y="35" width="52" height="1" fill="#c8c8c0" />
        <rect x="47" y="10" width="3" height="16" fill="#8a8a8a" />
        <rect x="47" y="10" width="1" height="16" fill="#c3c3c3" />
        <rect x="47" y="42" width="3" height="24" fill="#8a8a8a" />
        <rect x="47" y="42" width="1" height="24" fill="#c3c3c3" />
        <rect x="6" y="97" width="6" height="2" fill="#1a1a1a" />
        <rect x="48" y="97" width="6" height="2" fill="#1a1a1a" />
      </svg>
      {data.doodles.map((d, i) => {
        const spot = SPOTS[i % SPOTS.length];
        return (
          <button
            key={d.id}
            type="button"
            className="doodle"
            style={{ left: `${spot.left}%`, top: `${spot.top}%`, transform: `rotate(${spot.rot}deg)` }}
            onClick={() => onOpen(d)}
            title={d.title}
          >
            <i className="magnet" style={{ background: MAGNETS[i % MAGNETS.length] }} />
            {/* eslint-disable-next-line @next/next/no-img-element -- local doodle photo */}
            <img src={d.src} alt={d.title} />
          </button>
        );
      })}
      {!data.doodles.length && data.note && (
        <div className="sticky">
          <i className="magnet" style={{ background: MAGNETS[0] }} />
          {data.note}
        </div>
      )}
      {data.submitUrl && (
        <a className="submit-doodle" href={data.submitUrl} target="_blank" rel="noopener noreferrer">
          submit a doodle
        </a>
      )}
    </div>
  );
}
