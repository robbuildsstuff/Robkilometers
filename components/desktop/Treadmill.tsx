'use client';

import { useEffect, useRef, useState } from 'react';

// Treadmill.exe: the hedonic treadmill as a game. You run, you collect, the number goes down.
// There's always a way off.

const VW = 240; // logical pixels; everything is drawn S times bigger so the text stays crisp
const VH = 150;
const S = 3;
const BELT_Y = VH - 30; // top of the belt
const RUNNER_X = 78;

type Mode = 'intro' | 'run' | 'leaving' | 'off';

type Thing = { label: string; art: string[] };
// 9 x 9 pixel art for the things you collect. Letters are colours from PAL.
const THINGS: Thing[] = [
  { label: 'MONEY', art: ['.........', '.GGGGGGG.', '.GgggggG.', '.Gg$$$gG.', '.Gg$g$gG.', '.Gg$$$gG.', '.GgggggG.', '.GGGGGGG.', '.........'] },
  { label: 'A CAR', art: ['.........', '..RRRR...', '.RllllR..', 'RRRRRRRR.', 'RRRRRRRRR', 'RRRRRRRRR', '.KK...KK.', '.KK...KK.', '.........'] },
  { label: 'PROMOTION', art: ['.........', 'YYYYYYYYY', 'Y.YYYYY.Y', 'Y.YYYYY.Y', '.YYYYYYY.', '...YYY...', '....Y....', '..YYYYY..', '.........'] },
  { label: 'FOLLOWERS', art: ['.........', '.rr...rr.', 'rrrr.rrrr', 'rrrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'] },
  { label: 'BIGGER HOUSE', art: ['....M....', '...MMM...', '..MMMMM..', '.MMMMMMM.', 'MMMMMMMMM', '.CCCCCCC.', '.ClCCCKC.', '.CCCCCKC.', '.CCCCCKC.'] },
  { label: 'A BOAT', art: ['....W....', '....WW...', '....WWW..', '....WWWW.', '....K....', 'NNNNNNNNN', '.NNNNNNN.', '..NNNNN..', 'lllllllll'] },
  { label: 'A WATCH', art: ['...KKK...', '...KKK...', '..YYYYY..', '.YWWWWWY.', '.YWWKWWY.', '.YWWKKWY.', '..YYYYY..', '...KKK...', '...KKK...'] },
  { label: 'NEW PHONE', art: ['..KKKKK..', '..KlllK..', '..KlllK..', '..KlllK..', '..KlllK..', '..KlllK..', '..KlllK..', '..KKWKK..', '..KKKKK..'] },
];
const PAL: Record<string, string> = {
  G: '#1f7a3a', g: '#7cc05a', $: '#f2f2c0', R: '#c8201a', l: '#9fd4ff', K: '#1a1a1a', Y: '#f2cf5b', r: '#e8506a',
  M: '#8a1410', C: '#e8dcc0', W: '#ffffff', N: '#1a3a9a',
};

// What the game says when the number goes down. Deadpan.
const LINES = [
  'Guess it’s not enough.',
  'Start again.',
  'Your neighbour got a bigger one.',
  'New model just came out.',
  'Almost there. (You’re not.)',
  'Now you need two.',
  'Someone online has three.',
  'Have you tried wanting more?',
  'Upgrade available.',
  'That was last year’s.',
];
const GOALS = ['a car', 'a nicer car', 'two cars', 'the promotion', 'the next promotion', 'a bigger house', 'a boat', 'a bigger boat', 'more followers', 'everything'];

type Item = { x: number; y: number; t: number; got: boolean };
type Pop = { x: number; y: number; text: string; life: number };
type Bit = { x: number; y: number; vx: number; vy: number; life: number; c: string };

function blip(ctx: AudioContext | null, f: number, len = 0.08, type: OscillatorType = 'square', vol = 0.05) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  const now = ctx.currentTime;
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + len);
  o.connect(g).connect(ctx.destination);
  o.start(now);
  o.stop(now + len + 0.02);
}

export default function Treadmill({ onField }: { onField: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>('intro');
  const [muted, setMuted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [staying, setStaying] = useState(false);
  const modeRef = useRef(mode);
  const mutedRef = useRef(muted);
  const jumpRef = useRef(false);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const stepOff = () => {
    if (modeRef.current === 'run') setMode('leaving');
  };

  // keyboard: jump with space / up / W, step off with left / A / Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canvasRef.current?.isConnected) return;
      const k = e.key;
      if (modeRef.current === 'run' && (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W')) {
        e.preventDefault();
        jumpRef.current = true;
      } else if (modeRef.current === 'run' && (k === 'ArrowLeft' || k === 'a' || k === 'A' || k === 'Escape')) {
        e.preventDefault();
        setMode('leaving');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // the game loop
  useEffect(() => {
    const c = canvasRef.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    let audio: AudioContext | null = null;
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio = new Ctx();
    } catch {}
    const sound = (f: number, len?: number, type?: OscillatorType, vol?: number) => {
      if (mutedRef.current || !audio) return;
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      blip(audio, f, len, type, vol);
    };

    const P = (x: number, y: number, w: number, h: number, col: string) => {
      g.fillStyle = col;
      g.fillRect(Math.round(x) * S, Math.round(y) * S, Math.round(w) * S, Math.round(h) * S);
    };
    const art = (a: string[], x: number, y: number) => {
      for (let r = 0; r < a.length; r++)
        for (let q = 0; q < a[r].length; q++) {
          const col = PAL[a[r][q]];
          if (col) P(x + q, y + r, 1, 1, col);
        }
    };
    const text = (t: string, x: number, y: number, size: number, col: string, align: CanvasTextAlign = 'left', alpha = 1) => {
      g.globalAlpha = alpha;
      g.font = `700 ${size}px Tahoma, Verdana, sans-serif`;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.fillStyle = '#1a1a1a';
      g.fillText(t, x * S + 2, y * S + 2);
      g.fillStyle = col;
      g.fillText(t, x * S, y * S);
      g.globalAlpha = 1;
    };

    // game state
    let t0 = performance.now();
    let last = t0;
    let speed = 1.1;
    let dist = 0;
    let ry = 0; // runner height above the belt
    let vy = 0;
    let items: Item[] = [];
    let pops: Pop[] = [];
    let bits: Bit[] = [];
    let nextSpawn = 40;
    let score = 100; // shown as "HAPPINESS"
    let shown = 100;
    let dropAt = 0;
    let dropTo = 100;
    let got = 0;
    let goal = 0;
    let goalX = VW - 20; // the GOAL flag, which never gets closer
    let shake = 0;
    let leaveX = RUNNER_X;
    let calmT = 0;
    let raf = 0;
    let msgTimer = 0;
    let lineIdx = 0;

    const reset = () => {
      t0 = performance.now();
      speed = 1.1;
      dist = 0;
      ry = 0;
      vy = 0;
      items = [];
      pops = [];
      bits = [];
      nextSpawn = 40;
      score = shown = dropTo = 100;
      got = 0;
      goal = 0;
      goalX = VW - 20;
      leaveX = RUNNER_X;
      calmT = 0;
    };

    const say = (m: string) => {
      setMessage(m);
      clearTimeout(msgTimer);
      msgTimer = window.setTimeout(() => setMessage(null), 2200);
    };

    const drawRunner = (x: number, y: number, frame: number, sitting = false) => {
      if (sitting) {
        P(x, y - 13, 5, 4, '#2a1a10'); // hair
        P(x, y - 10, 5, 3, '#e0a878');
        P(x - 1, y - 7, 7, 5, '#c8201a'); // shirt
        P(x + 5, y - 3, 6, 2, '#2a2a40'); // legs out in front
        P(x + 10, y - 3, 2, 2, '#f2f2f2');
        return;
      }
      const leg = frame % 2;
      P(x, y - 22, 5, 3, '#2a1a10');
      P(x, y - 19, 5, 4, '#e0a878');
      P(x + 4, y - 18, 1, 1, '#1a1a1a');
      P(x - 1, y - 15, 7, 7, '#c8201a');
      // arms swing
      P(leg ? x - 3 : x + 5, y - 14, 3, 2, '#e0a878');
      P(leg ? x + 5 : x - 3, y - 12, 3, 2, '#e0a878');
      // legs
      P(x, y - 8, 2, leg ? 6 : 4, '#2a2a40');
      P(x + 3, y - 8, 2, leg ? 4 : 6, '#2a2a40');
      P(leg ? x - 1 : x + 3, y - 2, 3, 2, '#f2f2f2');
      P(leg ? x + 3 : x - 1, y - (leg ? 4 : 2), 3, 2, '#f2f2f2');
    };

    const drawGym = (t: number) => {
      // wall and window: a city you're too busy to look at
      P(0, 0, VW, BELT_Y, '#d8d2c0');
      P(0, BELT_Y - 6, VW, 6, '#b8b09a');
      P(20, 14, VW - 40, 60, '#5a6a8a');
      for (let i = 0; i < 9; i++) {
        const bx = 20 + ((i * 26 - (t * 3) % 26 + 260) % (VW - 40));
        const bh = 18 + ((i * 37) % 30);
        P(bx, 74 - bh, 16, bh, '#3a4560');
        for (let wy = 74 - bh + 3; wy < 72; wy += 5) P(bx + 3, wy, 2, 2, i % 3 ? '#f2cf5b' : '#8a92a8');
      }
      P(20, 14, VW - 40, 2, '#9aa4c0');
      P(VW / 2 - 1, 14, 2, 60, '#b8b09a');
      // belt
      P(0, BELT_Y, VW, 30, '#3a3a3a');
      P(0, BELT_Y, VW, 3, '#5a5a5a');
      for (let i = 0; i < 16; i++) P(((i * 18 - dist * 1.0) % (VW + 18) + VW + 18) % (VW + 18) - 9, BELT_Y + 6, 8, 1, '#4c4c4c');
      P(0, BELT_Y + 12, VW, 2, '#2a2a2a');
      // the console in front
      P(RUNNER_X + 30, BELT_Y - 40, 4, 40, '#7a7a7a');
      P(RUNNER_X + 26, BELT_Y - 44, 18, 8, '#4a4a4a');
      P(RUNNER_X + 28, BELT_Y - 42, 14, 4, speed > 2.6 ? '#e8506a' : '#7cc05a');
    };

    const drawCalm = (k: number) => {
      // a quiet field: same sky and grass as the field page
      const sky = Math.round(VH * 0.45);
      for (let y = 0; y < sky; y++) {
        const f = y / sky;
        P(0, y, VW, 1, `rgb(${Math.round(207 + f * 20)}, ${Math.round(227 - f * 6)}, ${Math.round(239 - f * 40)})`);
      }
      P(0, sky, VW, VH - sky, '#5f8a42');
      for (let i = 0; i < 260; i++) {
        const x = (i * 53) % VW;
        const y = sky + ((i * 29) % (VH - sky));
        const sway = Math.round(Math.sin(k * 1.4 + i) * 0.6);
        P(x + sway, y, 1, 2, i % 2 ? '#86ad5a' : '#4a7a34');
      }
      // clouds
      for (let i = 0; i < 3; i++) {
        const cx = ((i * 90 + k * (2 + i)) % (VW + 50)) - 30;
        P(cx, 10 + i * 9, 26 + i * 6, 3, '#f5f3ea');
        P(cx + 4, 8 + i * 9, 16, 2, '#f5f3ea');
      }
      drawRunner(VW / 2 - 4, sky + 30, 0, true);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      const m = modeRef.current;
      const t = (now - t0) / 1000;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      if (shake > 0) {
        g.translate((Math.random() - 0.5) * shake * S, (Math.random() - 0.5) * shake * S);
        shake = Math.max(0, shake - 0.3 * dt);
      }

      if (m === 'off') {
        calmT += dt / 60;
        drawCalm(calmT);
        return;
      }
      if (m === 'intro') {
        drawGym(0);
        drawRunner(RUNNER_X, BELT_Y, 0);
        return;
      }

      if (m === 'run') {
        speed = Math.min(4, 1.1 + t * 0.035);
        dist += speed * dt;
        // jump
        if (jumpRef.current && ry === 0) {
          vy = 4.2;
          sound(520, 0.06);
        }
        jumpRef.current = false;
        ry = Math.max(0, ry + vy * dt);
        vy = ry > 0 ? vy - 0.28 * dt : 0;
        // spawn things to want
        nextSpawn -= speed * dt;
        if (nextSpawn <= 0) {
          const high = Math.random() < 0.45;
          items.push({ x: VW + 6, y: high ? BELT_Y - 40 : BELT_Y - 14, t: Math.floor(Math.random() * THINGS.length), got: false });
          nextSpawn = 55 + Math.random() * 60;
        }
        // move things, collect what the runner touches
        for (const it of items) {
          it.x -= speed * dt;
          const runnerTop = BELT_Y - 22 - ry;
          if (!it.got && it.x < RUNNER_X + 6 && it.x + 9 > RUNNER_X - 1 && it.y < BELT_Y - ry && it.y + 9 > runnerTop) {
            it.got = true;
            got++;
            const thing = THINGS[it.t];
            pops.push({ x: it.x + 4, y: it.y - 4, text: `+1 ${thing.label}`, life: 1 });
            for (let i = 0; i < 14; i++)
              bits.push({ x: it.x + 4, y: it.y + 4, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3, life: 1, c: ['#f2cf5b', '#ffffff', '#e8506a', '#7cc05a'][i % 4] });
            sound(880, 0.07);
            setTimeout(() => sound(1320, 0.09), 60);
            // the number jumps up for a moment... then lands lower than before
            shown = score + 25;
            if (got % 5 === 0) {
              dropTo = 0;
              shake = 4;
            } else dropTo = Math.max(0, score - 7 - Math.floor(got / 2));
            dropAt = now + 550;
            goal = Math.min(GOALS.length - 1, goal + (got % 2 === 0 ? 1 : 0));
          }
        }
        items = items.filter((it) => it.x > -12 && !(it.got && it.x < RUNNER_X - 4));
        if (dropAt && now > dropAt) {
          score = dropTo;
          shown = dropTo;
          dropAt = 0;
          if (dropTo === 0) {
            sound(140, 0.35, 'sawtooth', 0.05);
            say(LINES[lineIdx++ % LINES.length]);
            score = shown = 100; // and around we go
          } else if (got % 3 === 0) say(LINES[lineIdx++ % LINES.length]);
        }
        // the goal flag drifts away
        goalX = Math.min(VW - 14, goalX + 0.02 * dt);
      }

      drawGym(dist / 40);

      // the GOAL flag, always just out of reach
      P(goalX, BELT_Y - 34, 1, 34, '#4a4a4a');
      P(goalX + 1, BELT_Y - 34, 10, 6, '#2f9e4a');
      text('GOAL', goalX - 2, BELT_Y - 39, 13, '#ffffff');

      for (const it of items) if (!it.got) {
        const bob = Math.sin((it.x + it.t * 7) / 6) * 1.2;
        art(THINGS[it.t].art, it.x, it.y + bob);
      }

      // runner (or the runner walking off the side)
      if (m === 'leaving') {
        leaveX -= 0.9 * dt;
        drawRunner(leaveX, BELT_Y, Math.floor(now / 140));
        if (leaveX < -10) setMode('off');
      } else drawRunner(RUNNER_X, BELT_Y - ry, ry > 0 ? 0 : Math.floor(dist / 6));

      // juice
      for (const b of bits) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy += 0.15 * dt;
        b.life -= 0.03 * dt;
        if (b.life > 0) P(b.x, b.y, 1, 1, b.c);
      }
      bits = bits.filter((b) => b.life > 0);
      for (const p of pops) {
        p.y -= 0.35 * dt;
        p.life -= 0.018 * dt;
        if (p.life > 0) text(p.text, p.x, p.y, 17, '#f2cf5b', 'center', Math.min(1, p.life * 2));
      }
      pops = pops.filter((p) => p.life > 0);

      // HUD: the number in the top right
      if (m === 'run') {
        P(VW - 62, 3, 59, 24, 'rgba(0,0,0,0.6)');
        text('HAPPINESS', VW - 58, 8.5, 13, '#c3c3c3');
        text(String(Math.round(shown)), VW - 6, 19, 26, shown < 30 ? '#e8506a' : '#ffffff', 'right');
        const label = `NEXT: ${GOALS[goal].toUpperCase()}`;
        g.font = '700 14px Tahoma, Verdana, sans-serif';
        P(3, 3, Math.ceil(g.measureText(label).width / S) + 8, 11, 'rgba(0,0,0,0.5)');
        text(label, 6, 8.8, 14, '#f2cf5b');
      }
    };
    raf = requestAnimationFrame(frame);

    // restart when a new run begins
    const restart = () => reset();
    c.addEventListener('treadmill-restart', restart);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(msgTimer);
      c.removeEventListener('treadmill-restart', restart);
      audio?.close().catch(() => {});
    };
  }, []);

  const start = () => {
    canvasRef.current?.dispatchEvent(new Event('treadmill-restart'));
    setMessage(null);
    setStaying(false);
    setMode('run');
  };

  return (
    <div className={`tm is-${mode}`}>
      <div className="tm-stage" onPointerDown={() => mode === 'run' && (jumpRef.current = true)}>
        <canvas ref={canvasRef} width={VW * S} height={VH * S} aria-label="A runner on a treadmill" role="img" />

        {mode === 'intro' && (
          <div className="tm-card bevel">
            <b>TREADMILL.EXE</b>
            <p>Instructions:</p>
            <ol>
              <li>Run forward.</li>
              <li>Collect everything: money, the car, the promotion, followers, a bigger house, the boat.</li>
              <li>More is better.</li>
            </ol>
            <p className="tm-keys">Space, ↑ or tap to jump.</p>
            <button type="button" className="bevel" onClick={start} autoFocus>
              Start running
            </button>
          </div>
        )}

        {message && mode === 'run' && <p className="tm-msg">{message}</p>}

        {mode === 'run' && (
          <button
            type="button"
            className="tm-off"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={stepOff}
            title="Step off the treadmill (← or Esc)"
          >
            ← step off
          </button>
        )}

        {mode === 'off' && (
          <div className="tm-calm">
            <p>this is great.</p>
            <div className={staying ? 'tm-hide' : undefined}>
              <button type="button" className="bevel" onClick={() => setStaying(true)} title="Stay here a while">
                stay
              </button>
              <button type="button" className="bevel" onClick={onField}>
                go to the field →
              </button>
              <button type="button" className="tm-again" onClick={start}>
                get back on
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="tm-bar">
        <span>{mode === 'off' ? 'Off the treadmill' : mode === 'run' ? 'Running…' : 'Ready'}</span>
        <button type="button" className="bevel wd-x" onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Sound on' : 'Sound off'} title={muted ? 'Sound off' : 'Sound on'}>
          {muted ? '♪̸' : '♪'}
        </button>
      </div>
    </div>
  );
}
