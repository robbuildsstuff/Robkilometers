'use client';

import { useEffect, useRef, useState } from 'react';

// A soft bell made in the browser (no sound file): a few sine partials that fade out.
function bell() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    for (const [f, v] of [
      [528, 0.22],
      [1056, 0.08],
      [1587, 0.04],
    ] as const) {
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.frequency.value = f;
      gn.gain.setValueAtTime(0.0001, now);
      gn.gain.exponentialRampToValueAtTime(v, now + 0.02);
      gn.gain.exponentialRampToValueAtTime(0.0001, now + 4);
      o.connect(gn).connect(ctx.destination);
      o.start(now);
      o.stop(now + 4.1);
    }
    setTimeout(() => ctx.close(), 4500);
  } catch {}
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

type Run = { mode: 'open' | 'preset'; total: number; startedAt: number };
// A short "get settled" countdown that runs between pressing a button and the timer actually starting.
type Pending = { minutes: number | null; startedAt: number };

const GET_READY_SECONDS = 5;

export default function Meditation({ onClose }: { onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [now, setNow] = useState(0);
  const [finished, setFinished] = useState<number | null>(null);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const begin = (minutes: number | null) => {
    if (!mutedRef.current) bell();
    const t = Date.now();
    setNow(t);
    setPending(null);
    setRun({ mode: minutes ? 'preset' : 'open', total: (minutes ?? 0) * 60, startedAt: t });
  };

  // Start (open-ended) gets a get-ready countdown first; the 1/5/10/20 min presets start straight away.
  const start = (minutes: number | null) => {
    setFinished(null);
    if (minutes) return begin(minutes);
    const t = Date.now();
    setNow(t);
    setPending({ minutes, startedAt: t });
  };

  const finish = (sat: number) => {
    if (!mutedRef.current) bell();
    setRun(null);
    setFinished(sat);
  };

  // tick
  useEffect(() => {
    if (!run && !pending) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [run, pending]);

  // when the get-ready countdown runs out, roll straight into the chosen session
  const readyLeft = pending ? Math.max(0, GET_READY_SECONDS - (now - pending.startedAt) / 1000) : 0;
  useEffect(() => {
    if (pending && readyLeft <= 0) {
      const t = setTimeout(() => begin(pending.minutes), 0);
      return () => clearTimeout(t);
    }
  });

  const elapsed = run ? Math.max(0, (now - run.startedAt) / 1000) : 0;
  useEffect(() => {
    if (run?.mode === 'preset' && elapsed >= run.total) {
      const t = setTimeout(() => finish(run.total), 0);
      return () => clearTimeout(t);
    }
  });

  const shown = run ? (run.mode === 'preset' ? Math.max(0, run.total - elapsed) : elapsed) : 0;

  return (
    <div className="med-wrap" onClick={onClose}>
      <div className="med" role="dialog" aria-label="Meditate" onClick={(e) => e.stopPropagation()}>
        <div className="wd-card-bar">
          <span>Meditate</span>
          <span className="med-bar-btns">
            <button type="button" className="bevel wd-x med-mute" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Turn the bell on' : 'Turn the bell off'} title={muted ? 'Bell off' : 'Bell on'}>
              {muted ? '♪̸' : '♪'}
            </button>
            <button type="button" className="bevel wd-x" onClick={onClose} aria-label="Close">
              ×
            </button>
          </span>
        </div>
        <div className="med-body">
          {pending ? (
            <>
              <p className="med-intro">Get comfortable. Starting in…</p>
              <p className="med-time" aria-live="polite">
                {Math.ceil(readyLeft)}
              </p>
              <button type="button" className="bevel med-main" onClick={() => setPending(null)}>
                Cancel
              </button>
            </>
          ) : run ? (
            <>
              <div className="med-breath" aria-hidden="true">
                <i />
              </div>
              <p className="med-cue" aria-hidden="true">
                <span className="in">breathe in</span>
                <span className="out">breathe out</span>
              </p>
              <p className="med-time">{mmss(shown)}</p>
              <button type="button" className="bevel med-main" onClick={() => finish(elapsed)}>
                {run.mode === 'open' ? 'Finish' : 'Stop'}
              </button>
            </>
          ) : (
            <>
              {finished !== null ? (
                <p className="med-done">
                  You sat for <b>{mmss(finished)}</b>. Nice.
                </p>
              ) : (
                <p className="med-intro">Sit as long or as short as you like.</p>
              )}
              <button type="button" className="bevel med-main" onClick={() => start(null)}>
                Start
              </button>
              <div className="med-presets">
                {[1, 5, 10, 20].map((m) => (
                  <button key={m} type="button" className="bevel" onClick={() => start(m)}>
                    {m} min
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
