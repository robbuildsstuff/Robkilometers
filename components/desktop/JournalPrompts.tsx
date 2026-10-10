'use client';

import { useState } from 'react';
import type { PromptsItem } from '@/content';

// Journal prompts: pick a level, get a random prompt to write about in your own notebook. Nothing is saved.
export default function JournalPrompts({ it }: { it: PromptsItem }) {
  const [level, setLevel] = useState(0);
  const [i, setI] = useState(0);
  const prompts = it.levels[level]?.prompts ?? [];

  // a different random prompt each time (never the same one twice in a row)
  const another = (lv = level) => {
    const n = it.levels[lv]?.prompts.length ?? 0;
    if (n < 2) return setI(0);
    let next = Math.floor(Math.random() * n);
    if (lv === level && next === i) next = (next + 1) % n;
    setI(next);
  };

  return (
    <div className="jp">
      {it.intro && <p className="jp-intro">{it.intro}</p>}
      <div className="jp-levels" role="radiogroup" aria-label="How deep">
        {it.levels.map((l, k) => (
          <button
            key={l.name}
            type="button"
            role="radio"
            aria-checked={k === level}
            className={`bevel${k === level ? ' on' : ''}`}
            onClick={() => {
              setLevel(k);
              another(k);
            }}
            title={l.blurb}
          >
            {l.name}
          </button>
        ))}
      </div>
      <div className="jp-card sunken">
        <p aria-live="polite">{prompts[i]}</p>
      </div>
      <div className="jp-foot">
        <small>{it.levels[level]?.blurb}</small>
        <button type="button" className="bevel jp-next" onClick={() => another()}>
          Another one ↻
        </button>
      </div>
    </div>
  );
}
