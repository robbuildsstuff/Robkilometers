'use client';

import { useEffect, useRef, useState } from 'react';
import { site, visibleFolders, type Folder } from '@/content';
import { Icon } from './icons';
import type { WinFrame } from './Window';

type Props = {
  wins: WinFrame[];
  activeKey: string | null;
  onTask: (key: string) => void;
  onAbout: () => void;
  onReadme: () => void;
  onFolder: (f: Folder) => void;
  onCopy: (text: string) => void;
  onShutDown: () => void;
};

const torontoTime = () =>
  new Date().toLocaleTimeString('en-CA', { timeZone: 'America/Toronto', hour: 'numeric', minute: '2-digit' });

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(torontoTime());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 20000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <span title="Toronto time" suppressHydrationWarning>
      {time}
    </span>
  );
}

export default function Taskbar({ wins, activeKey, onTask, onAbout, onReadme, onFolder, onCopy, onShutDown }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !startRef.current?.contains(t)) setMenuOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [menuOpen]);

  // Every start-menu action closes the menu first.
  const run = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <>
      <nav id="taskbar" aria-label="Taskbar">
        <button
          ref={startRef}
          id="start"
          type="button"
          className={`bevel${menuOpen ? ' down' : ''}`}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name="km" />
          <span>Start</span>
        </button>
        <div className="grip" />
        <div id="quick">
          {site.taskbar.map((l) =>
            'email' in l ? (
              <button
                key={l.label}
                type="button"
                title={`${l.label}: ${l.email}`}
                aria-label={`${l.label}: ${l.email}`}
                onClick={() => onCopy(l.email)}
              >
                <Icon name={l.icon} />
              </button>
            ) : (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" title={l.label} aria-label={l.label}>
                <Icon name={l.icon} />
              </a>
            ),
          )}
        </div>
        <div className="grip" />
        <div id="tasks">
          {wins.map((w) => (
            <button
              key={w.key}
              type="button"
              className={`task bevel${w.key === activeKey ? ' down' : ''}`}
              title={w.title}
              onClick={() => onTask(w.key)}
            >
              <Icon name={w.icon} />
              <span>{w.title}</span>
            </button>
          ))}
        </div>
        <div id="tray">
          <span className="km">{site.coords.split(' ')[0]}</span>
          <Clock />
        </div>
      </nav>

      {menuOpen && (
        <div id="menu" ref={menuRef} className="win active">
          <div className="side">
            <b>
              rob<i>OS</i> 98
            </b>
          </div>
          <ul>
            <li>
              <button type="button" onClick={run(onAbout)}>
                <Icon name="computer" />
                <span>About Rob</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={run(onReadme)}>
                <Icon name="notepad" />
                <span>Read me</span>
              </button>
            </li>
            <li>
              <hr />
            </li>
            {visibleFolders.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={run(() => onFolder(f))}>
                  <Icon name={f.icon ?? 'folder'} />
                  <span>{f.name}</span>
                </button>
              </li>
            ))}
            <li>
              <hr />
            </li>
            {site.taskbar.map((l) => (
              <li key={l.label}>
                {'email' in l ? (
                  <button type="button" onClick={run(() => onCopy(l.email))}>
                    <Icon name={l.icon} />
                    <span>{l.label}</span>
                  </button>
                ) : (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                    <Icon name={l.icon} />
                    <span>{l.label}</span>
                  </a>
                )}
              </li>
            ))}
            <li>
              <hr />
            </li>
            <li>
              <button type="button" onClick={run(onShutDown)}>
                <Icon name="shutdown" />
                <span>Shut Down...</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
