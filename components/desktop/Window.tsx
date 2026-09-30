'use client';

import { useRef } from 'react';
import type { IconName } from '@/content';
import { CloseGlyph, Icon, MaxGlyph, MinGlyph } from './icons';

export type WinFrame = {
  key: string;
  title: string;
  icon: IconName;
  x: number;
  y: number;
  w: number;
  h?: number;
  z: number;
  min: boolean;
  max: boolean;
};

type Props = {
  win: WinFrame;
  active: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMin: () => void;
  onToggleMax: () => void;
  onMove: (x: number, y: number) => void;
  children: React.ReactNode;
};

const isNarrow = () => window.matchMedia('(max-width: 640px)').matches;

export default function Window({ win, active, onFocus, onClose, onMin, onToggleMax, onMove, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  function startDrag(e: React.PointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest('button') || win.max || isNarrow() || !ref.current) return;
    const el = ref.current;
    const dx = e.clientX - el.offsetLeft;
    const dy = e.clientY - el.offsetTop;
    const bar = e.currentTarget;
    bar.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => onMove(ev.clientX - dx, ev.clientY - dy);
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  }

  return (
    <section
      ref={ref}
      className={`win${active ? ' active' : ''}${win.max ? ' max' : ''}`}
      role="dialog"
      aria-label={win.title}
      hidden={win.min}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDown={onFocus}
    >
      <header
        className="tb"
        onPointerDown={startDrag}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest('button') && !isNarrow()) onToggleMax();
        }}
      >
        <span className="ti">
          <Icon name={win.icon} />
        </span>
        <span className="tt">{win.title}</span>
        <div className="tbb">
          <button type="button" aria-label="Minimize" onClick={onMin}>
            <MinGlyph />
          </button>
          <button type="button" className="maxbtn" aria-label={win.max ? 'Restore' : 'Maximize'} onClick={onToggleMax}>
            <MaxGlyph />
          </button>
          <button type="button" className="closebtn" aria-label="Close" onClick={onClose}>
            <CloseGlyph />
          </button>
        </div>
      </header>
      <div className="wb">{children}</div>
    </section>
  );
}
