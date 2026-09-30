'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { site, type Folder, type IconName, type Item } from '@/content';
import FolderView from './FolderView';
import IconButton from './IconButton';
import Profile from './Profile';
import Taskbar from './Taskbar';
import { ItemView, Notepad, itemSize, itemWindowTitle, typeIcon } from './viewers';
import Window, { type WinFrame } from './Window';

// What a window shows. The window key doubles as its deep link: #food, #food.lemon-pasta, #about.
type Target =
  | { kind: 'folder'; folder: Folder }
  | { kind: 'item'; folder: Folder; item: Item }
  | { kind: 'about' }
  | { kind: 'readme' };

type Win = WinFrame & { target: Target };

type OpenSpec = { title: string; icon: IconName; w: number; h?: number; target: Target };

const folderById = (id: string) => site.folders.find((f) => f.id === id);
const topZ = (ws: Win[]) => ws.reduce((z, w) => Math.max(z, w.z), 10);
const isNarrow = () => window.matchMedia('(max-width: 640px)').matches;

function setHash(h: string) {
  try {
    history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search);
  } catch {}
}

export default function Desktop() {
  const deskRef = useRef<HTMLDivElement>(null);
  const [wins, setWins] = useState<Win[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [off, setOff] = useState(false);

  const activeKey = wins.reduce<Win | null>((top, w) => (!w.min && (!top || w.z > top.z) ? w : top), null)?.key ?? null;

  const focus = useCallback((key: string) => {
    setWins((ws) => {
      const w = ws.find((x) => x.key === key);
      const z = topZ(ws);
      if (!w || (!w.min && w.z === z)) return ws;
      return ws.map((x) => (x.key === key ? { ...x, min: false, z: z + 1 } : x));
    });
  }, []);

  const open = useCallback(
    (key: string, spec: OpenSpec) => {
      setWins((ws) => {
        if (ws.some((w) => w.key === key)) return ws;
        const desk = deskRef.current;
        const dw = desk?.clientWidth ?? 1024;
        const dh = desk?.clientHeight ?? 700;
        const w = Math.min(spec.w, dw - 16);
        const off = (ws.length % 7) * 26;
        const x = Math.max(8, Math.min(dw - w - 8, 130 + off + Math.max(0, (dw - w - 130) / 2 - 60)));
        const y = Math.max(8, Math.min(dh - 200, 24 + off));
        const h = spec.h ? Math.min(spec.h, dh - 16) : undefined;
        return [...ws, { key, ...spec, w, h, x, y, z: topZ(ws) + 1, min: false, max: false }];
      });
      focus(key);
    },
    [focus],
  );

  const openFolder = useCallback(
    (folder: Folder) => {
      open(folder.id, { title: folder.name, icon: folder.icon ?? 'folder', w: 500, h: 360, target: { kind: 'folder', folder } });
      setHash(folder.id);
    },
    [open],
  );

  const openItem = useCallback(
    (folder: Folder, item: Item) => {
      const [w, h] = itemSize[item.type];
      const key = `${folder.id}.${item.id}`;
      open(key, { title: itemWindowTitle(item), icon: typeIcon[item.type], w, h, target: { kind: 'item', folder, item } });
      setHash(key);
    },
    [open],
  );

  const openAbout = useCallback(() => {
    open('about', { title: `${site.handle} - Profile`, icon: 'computer', w: 720, h: 540, target: { kind: 'about' } });
    setHash('about');
  }, [open]);

  const openReadme = useCallback(() => {
    open('readme', { title: `${site.readme.title} - Notepad`, icon: 'notepad', w: 440, h: 360, target: { kind: 'readme' } });
  }, [open]);

  // Opens whatever the URL hash points at. Returns false if it points at nothing.
  const openFromHash = useCallback(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'about') {
      openAbout();
      return true;
    }
    const dot = h.indexOf('.');
    const folder = folderById(dot === -1 ? h : h.slice(0, dot));
    if (!folder) return false;
    openFolder(folder);
    const item = dot === -1 ? undefined : folder.items.find((it) => it.id === h.slice(dot + 1));
    if (item) openItem(folder, item);
    return true;
  }, [openAbout, openFolder, openItem]);

  // Boot: open from the link, or show the readme on bigger screens.
  useEffect(() => {
    const boot = setTimeout(() => {
      if (!openFromHash() && !isNarrow()) openReadme();
    }, 0);
    const onHash = () => openFromHash();
    window.addEventListener('hashchange', onHash);
    return () => {
      clearTimeout(boot);
      window.removeEventListener('hashchange', onHash);
    };
  }, [openFromHash, openReadme]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const copy = useCallback((text: string) => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(text))
      .then(
        () => setToast(`Copied ${text}`),
        () => setToast(text),
      );
  }, []);

  const close = (key: string) => {
    setWins((ws) => ws.filter((w) => w.key !== key));
    if (decodeURIComponent(location.hash.slice(1)) === key) setHash('');
  };
  const minimize = (key: string) => setWins((ws) => ws.map((w) => (w.key === key ? { ...w, min: true } : w)));
  const toggleMax = (key: string) => setWins((ws) => ws.map((w) => (w.key === key ? { ...w, max: !w.max } : w)));
  const move = (key: string, x: number, y: number) => {
    const desk = deskRef.current;
    if (!desk) return;
    setWins((ws) =>
      ws.map((w) =>
        w.key === key
          ? {
              ...w,
              x: Math.max(-w.w + 60, Math.min(desk.clientWidth - 60, x)),
              y: Math.max(0, Math.min(desk.clientHeight - 24, y)),
            }
          : w,
      ),
    );
  };

  function body(t: Target) {
    switch (t.kind) {
      case 'folder':
        return <FolderView folder={t.folder} onOpenItem={(it) => openItem(t.folder, it)} />;
      case 'item':
        return <ItemView it={t.item} />;
      case 'about':
        return <Profile onOpenItem={openItem} onCopy={copy} />;
      case 'readme':
        return <Notepad body={site.readme.body} />;
    }
  }

  const desktopIcons: { id: string; icon: IconName; label: string; open: () => void }[] = [
    { id: 'about', icon: 'computer', label: "Rob's Computer", open: openAbout },
    { id: 'readme', icon: 'notepad', label: site.readme.title, open: openReadme },
    ...site.folders.map((f) => ({ id: f.id, icon: f.icon ?? ('folder' as IconName), label: f.name, open: () => openFolder(f) })),
  ];

  return (
    <>
      <div
        id="desktop"
        ref={deskRef}
        onPointerDown={(e) => {
          const t = e.target as HTMLElement;
          if (t === e.currentTarget || t.id === 'icons') setSelectedIcon(null);
        }}
      >
        <div id="icons" role="list">
          {desktopIcons.map((d) => (
            <div key={d.id} role="listitem">
              <IconButton
                className="dicon"
                icon={d.icon}
                label={d.label}
                selected={selectedIcon === d.id}
                onSelect={() => setSelectedIcon(d.id)}
                onOpen={d.open}
              />
            </div>
          ))}
        </div>

        {wins.map((w) => (
          <Window
            key={w.key}
            win={w}
            active={w.key === activeKey}
            onFocus={() => focus(w.key)}
            onClose={() => close(w.key)}
            onMin={() => minimize(w.key)}
            onToggleMax={() => toggleMax(w.key)}
            onMove={(x, y) => move(w.key, x, y)}
          >
            {body(w.target)}
          </Window>
        ))}
      </div>

      <Taskbar
        wins={wins}
        activeKey={activeKey}
        onTask={(key) => {
          const w = wins.find((x) => x.key === key);
          if (key === activeKey) minimize(key);
          else if (w) focus(key);
        }}
        onAbout={openAbout}
        onReadme={openReadme}
        onFolder={openFolder}
        onCopy={copy}
        onShutDown={() => setOff(true)}
      />

      {off && (
        <div id="off" onClick={() => setOff(false)}>
          <div>
            <p>
              It&apos;s now safe to turn off
              <br />
              your computer.
            </p>
            <small>click anywhere to start again</small>
          </div>
        </div>
      )}

      {toast && (
        <div id="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
