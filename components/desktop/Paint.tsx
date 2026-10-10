'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// MS Paint, more or less. Nothing is saved on the site: File > Save downloads a PNG.
// The sheet is landscape on bigger screens and portrait on phones (decided when Paint opens).
const LANDSCAPE = { w: 960, h: 600 };
const PORTRAIT = { w: 600, h: 840 };
const UNDO_LIMIT = 25;

type Tool = 'pencil' | 'brush' | 'eraser' | 'fill' | 'line' | 'rect' | 'ellipse' | 'spray';

// The classic Paint palette, two rows
const COLOURS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
];

const SIZES = [1, 3, 6, 12];

// Tiny pixel glyphs for the tool buttons (12 x 12, drawn as SVG rects)
const GLYPHS: Record<Tool, string> = {
  pencil: 'M8 1h2v1h1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-2h1v-1h1v-1h1v-1h1v-1h1v-1h1z',
  brush: 'M9 1h2v2h-1v1h-1v1h-1v1h-1v1h-2v-1h1v-1h1v-1h1v-1h1zM3 7h2v2h-1v1h-1v1h-2v-1h1v-1h1z',
  eraser: 'M6 2h2v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-4v-1h-1v-1h-1v-2h1v-1h1v-1h1v-1h1z',
  fill: 'M4 1h2v1h1v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-2h1v-1h1zM10 7h1v2h1v2h-2v-2h-1v-1h1z',
  line: 'M10 1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1z',
  rect: 'M1 2h10v8h-10zM2 3v6h8v-6z',
  ellipse: 'M4 2h4v1h2v1h1v4h-1v1h-2v1h-4v-1h-2v-1h-1v-4h1v-1h2zM4 3v1h-2v4h2v1h4v-1h2v-4h-2v-1z',
  spray: 'M3 4h4v7h-4zM4 2h2v2h-2zM8 1h1v1h-1zM10 2h1v1h-1zM8 3h1v1h-1zM10 4h1v1h-1zM9 5h1v1h-1z',
};

const TOOL_NAMES: Record<Tool, string> = {
  pencil: 'Pencil',
  brush: 'Brush',
  eraser: 'Eraser',
  fill: 'Fill with colour',
  line: 'Line',
  rect: 'Rectangle',
  ellipse: 'Ellipse',
  spray: 'Airbrush',
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Scanline flood fill on the canvas pixels
function floodFill(g: CanvasRenderingContext2D, x0: number, y0: number, hex: string, W: number, H: number) {
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  const at = (x: number, y: number) => (y * W + x) * 4;
  const s = at(x0, y0);
  const target = [d[s], d[s + 1], d[s + 2], d[s + 3]];
  const [r, gr, b] = hexToRgb(hex);
  if (target[0] === r && target[1] === gr && target[2] === b && target[3] === 255) return;
  const same = (i: number) => d[i] === target[0] && d[i + 1] === target[1] && d[i + 2] === target[2] && d[i + 3] === target[3];
  const stack = [[x0, y0]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    let lx = x;
    while (lx > 0 && same(at(lx - 1, y))) lx--;
    let up = false;
    let down = false;
    for (let cx = lx; cx < W && same(at(cx, y)); cx++) {
      const i = at(cx, y);
      d[i] = r;
      d[i + 1] = gr;
      d[i + 2] = b;
      d[i + 3] = 255;
      if (y > 0) {
        const u = same(at(cx, y - 1));
        if (u && !up) stack.push([cx, y - 1]);
        up = u;
      }
      if (y < H - 1) {
        const v = same(at(cx, y + 1));
        if (v && !down) stack.push([cx, y + 1]);
        down = v;
      }
    }
  }
  g.putImageData(img, 0, 0);
}

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(3);
  const [menu, setMenu] = useState<'file' | 'edit' | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const undo = useRef<ImageData[]>([]);
  const drag = useRef<{ x: number; y: number; colour: string; snap: ImageData; spray?: number; last: { x: number; y: number } } | null>(null);

  const sheet = useRef(LANDSCAPE);
  const ctx = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;

  // portrait sheet on phones held upright, then start with a white sheet
  useLayoutEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    sheet.current = window.innerWidth < 600 && window.innerHeight > window.innerWidth ? PORTRAIT : LANDSCAPE;
    c.width = sheet.current.w;
    c.height = sheet.current.h;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
  }, []);

  const pushUndo = () => {
    const g = ctx();
    if (!g) return;
    undo.current.push(g.getImageData(0, 0, sheet.current.w, sheet.current.h));
    if (undo.current.length > UNDO_LIMIT) undo.current.shift();
    setCanUndo(true);
  };

  const doUndo = () => {
    const g = ctx();
    const prev = undo.current.pop();
    if (g && prev) g.putImageData(prev, 0, 0);
    setCanUndo(undo.current.length > 0);
    setMenu(null);
  };

  const clear = () => {
    const g = ctx();
    if (!g) return;
    pushUndo();
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, sheet.current.w, sheet.current.h);
    setMenu(null);
  };

  const save = () => {
    setMenu(null);
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'my-painting.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, 'image/png');
  };

  // Ctrl/Cmd+Z undoes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && canvasRef.current?.isConnected) {
        e.preventDefault();
        const g = canvasRef.current.getContext('2d');
        const prev = undo.current.pop();
        if (g && prev) g.putImageData(prev, 0, 0);
        setCanUndo(undo.current.length > 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const point = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: Math.round(((e.clientX - r.left) / r.width) * sheet.current.w), y: Math.round(((e.clientY - r.top) / r.height) * sheet.current.h) };
  };

  const lineWidth = () => (tool === 'pencil' ? 1 : tool === 'eraser' ? size * 3 : size);

  const stroke = (g: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }, colour: string) => {
    g.strokeStyle = colour;
    g.lineWidth = lineWidth();
    g.lineCap = tool === 'pencil' ? 'square' : 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(a.x + 0.5, a.y + 0.5);
    g.lineTo(b.x + 0.5, b.y + 0.5);
    g.stroke();
  };

  const spray = (g: CanvasRenderingContext2D, p: { x: number; y: number }, colour: string) => {
    const radius = size * 3 + 4;
    g.fillStyle = colour;
    for (let i = 0; i < radius * 1.5; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      g.fillRect(Math.round(p.x + Math.cos(a) * r), Math.round(p.y + Math.sin(a) * r), 1, 1);
    }
  };

  const shape = (g: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }, colour: string) => {
    g.strokeStyle = colour;
    g.lineWidth = size;
    g.lineCap = 'round';
    g.beginPath();
    if (tool === 'line') {
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    } else if (tool === 'rect') {
      g.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    } else {
      g.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
    }
    g.stroke();
  };

  const down = (e: React.PointerEvent) => {
    const g = ctx();
    if (!g || (e.button !== 0 && e.button !== 2)) return;
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    setMenu(null);
    const p = point(e);
    // right button paints with the background colour, like the real thing
    const colour = tool === 'eraser' ? bg : e.button === 2 ? bg : fg;
    pushUndo();
    if (tool === 'fill') {
      const { w, h } = sheet.current;
      if (p.x >= 0 && p.y >= 0 && p.x < w && p.y < h) floodFill(g, p.x, p.y, colour, w, h);
      return;
    }
    const snap = g.getImageData(0, 0, sheet.current.w, sheet.current.h);
    drag.current = { x: p.x, y: p.y, colour, snap, last: p };
    if (tool === 'spray') {
      spray(g, p, colour);
      drag.current.spray = window.setInterval(() => drag.current && spray(g, drag.current.last, colour), 30);
    } else if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      stroke(g, p, p, colour);
    }
  };

  const move = (e: React.PointerEvent) => {
    const g = ctx();
    const d = drag.current;
    if (!g || !d) return;
    const p = point(e);
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') stroke(g, d.last, p, d.colour);
    else if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      g.putImageData(d.snap, 0, 0);
      shape(g, d, p, d.colour);
    }
    d.last = p;
  };

  const up = () => {
    if (drag.current?.spray) clearInterval(drag.current.spray);
    drag.current = null;
  };

  return (
    <div className="paint" onClick={() => menu && setMenu(null)}>
      <div className="menubar paint-menus">
        <span className="paint-menu">
          <button type="button" onClick={(e) => (e.stopPropagation(), setMenu(menu === 'file' ? null : 'file'))}>
            File
          </button>
          {menu === 'file' && (
            <span className="paint-drop bevel" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={clear}>
                New
              </button>
              <button type="button" onClick={save}>
                Save as PNG…
              </button>
            </span>
          )}
        </span>
        <span className="paint-menu">
          <button type="button" onClick={(e) => (e.stopPropagation(), setMenu(menu === 'edit' ? null : 'edit'))}>
            Edit
          </button>
          {menu === 'edit' && (
            <span className="paint-drop bevel" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={doUndo} disabled={!canUndo}>
                Undo
              </button>
              <button type="button" onClick={clear}>
                Clear image
              </button>
            </span>
          )}
        </span>
      </div>
      <div className="paint-main">
        <div className="paint-tools">
          <div className="paint-toolgrid">
            {(Object.keys(GLYPHS) as Tool[]).map((t) => (
              <button key={t} type="button" className={`bevel${tool === t ? ' on' : ''}`} onClick={() => setTool(t)} title={TOOL_NAMES[t]} aria-label={TOOL_NAMES[t]} aria-pressed={tool === t}>
                <svg viewBox="0 0 12 12" width="16" height="16" shapeRendering="crispEdges" fillRule="evenodd">
                  <path d={GLYPHS[t]} fill="#000" />
                </svg>
              </button>
            ))}
          </div>
          <div className="paint-sizes sunken" aria-label="Size">
            {SIZES.map((s) => (
              <button key={s} type="button" className={size === s ? 'on' : ''} onClick={() => setSize(s)} aria-label={`Size ${s}`} aria-pressed={size === s}>
                <i style={{ height: Math.max(1, Math.min(s, 10)) }} />
              </button>
            ))}
          </div>
        </div>
        <div className="paint-sheet sunken">
          <canvas
            ref={canvasRef}
            width={LANDSCAPE.w}
            height={LANDSCAPE.h}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Drawing canvas"
          />
        </div>
      </div>
      <div className="paint-colours">
        <div className="paint-current" title="Left click picks the main colour, right click the background colour">
          <i className="bg" style={{ background: bg }} />
          <i className="fg" style={{ background: fg }} />
        </div>
        <div className="paint-palette">
          {COLOURS.map((c) => (
            <button
              key={c}
              type="button"
              style={{ background: c }}
              aria-label={`Colour ${c}`}
              onClick={() => setFg(c)}
              onContextMenu={(e) => {
                e.preventDefault();
                setBg(c);
              }}
            />
          ))}
        </div>
        <button type="button" className="bevel paint-save" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}
