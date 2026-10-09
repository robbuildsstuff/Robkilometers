'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { site, visibleFolders, type Banner, type Bookshelf, type ContentItem, type TravelCountry, type Wardrobe, type Folder, type Friend, type IconName, type Item } from '@/content';
import FriendPhotos from './FriendPhotos';
import MakeOwnView from './MakeOwnView';
import FieldPage from './FieldPage';
import FolderView from './FolderView';
import Stickers from './Stickers';
import IconButton from './IconButton';
import Profile from './Profile';
import ReadmeView from './ReadmeView';
import Solitaire from './Solitaire';
import Taskbar from './Taskbar';
import { ItemView, itemSize, itemWindowTitle, typeIcon } from './viewers';
import WeatherView from './WeatherView';
import Window, { type WinFrame } from './Window';

// A folder window's contents: a top-level desktop folder or a folder item nested inside one.
type FolderNode = { name: string; icon: IconName; blurb?: string; banner?: Banner; bookshelf?: Bookshelf; wardrobe?: Wardrobe; travel?: TravelCountry[]; items: Item[] };

// What a window shows. The window key doubles as its deep link: #food, #food.city-guides.paris, #about.
type Target =
  | { kind: 'folder'; path: string[]; trail: string[]; node: FolderNode; pick?: string }
  | { kind: 'item'; item: ContentItem }
  | { kind: 'about' }
  | { kind: 'readme' }
  | { kind: 'weather' }
  | { kind: 'solitaire' }
  | { kind: 'friend'; friend: Friend }
  | { kind: 'make-own' };

type Win = WinFrame & { target: Target };

type OpenSpec = { title: string; icon: IconName; w: number; h?: number; target: Target };

const topFolderNode = (f: Folder): FolderNode => ({ name: f.name, icon: f.icon ?? 'folder', blurb: f.blurb, banner: f.banner, bookshelf: f.bookshelf, wardrobe: f.wardrobe, travel: f.travel, items: f.items });

// Walks a path of ids (['food', 'city-guides', 'paris']) down from the desktop.
// Returns the chain of folders passed through and, if the path ends on one, the item.
function resolve(path: string[]) {
  const top = visibleFolders.find((f) => f.id === path[0]);
  if (!top) return null;
  const folders = [topFolderNode(top)];
  for (let i = 1; i < path.length; i++) {
    const it = folders[folders.length - 1].items.find((x) => x.id === path[i]);
    if (!it) return null;
    if (it.type !== 'folder') return i === path.length - 1 ? { folders, item: it } : null;
    folders.push({ name: it.title, icon: it.icon ?? 'folder', blurb: it.blurb, items: it.items });
  }
  return { folders, item: undefined };
}

// Old links that moved.
const aliases: Record<string, string> = {
  'food.toronto-eats': 'food.city-guides.toronto',
  'food.food-list': 'food.grocery-list',
  'running.cycling': 'cycling',
  clothes: 'wardrobe',
  'food.osaka': 'food.oretachi-no-curry-ya',
  'food.bobs-secret-sauce': 'food.cashew-butter-dressing',
};

// Applies an alias to a link or anything under it: running.cycling.wout-wout -> cycling.wout-wout
const unalias = (h: string) => {
  const from = Object.keys(aliases).find((a) => h === a || h.startsWith(a + '.'));
  return from ? aliases[from] + h.slice(from.length) : h;
};

// The window contents for a folder path, or null if the path isn't a folder.
function folderTarget(path: string[]) {
  const r = resolve(path);
  if (!r || r.item) return null;
  const node = r.folders[r.folders.length - 1];
  return { kind: 'folder' as const, path, trail: r.folders.map((f) => f.name), node };
}
// The screens you can slide between with the arrows at the edges. Page 0 is the desktop.
const PAGES = ['desktop', 'field'] as const;

const topZ = (ws: Win[]) => ws.reduce((z, w) => Math.max(z, w.z), 10);
const isNarrow = () => window.matchMedia('(max-width: 640px)').matches;

const friendSlug = (f: Friend) => f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

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
  const [page, setPage] = useState(0);
  const goPage = (n: number) => {
    const p = Math.max(0, Math.min(PAGES.length - 1, n));
    setPage(p);
    setHash(p ? PAGES[p] : '');
  };
  // swipe between pages on phones (only on the background, so windows still scroll and drag)
  const swipeX = useRef<number | null>(null);

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

  const openFolderAt = useCallback(
    (path: string[], trail: string[], node: FolderNode, pick?: string) => {
      const key = path.join('.');
      open(key, {
        title: node.name,
        icon: node.icon,
        w: node.bookshelf ? 700 : node.wardrobe ? 540 : node.travel ? 780 : 500,
        h: node.bookshelf ? 540 : node.wardrobe ? 640 : node.travel ? 500 : node.banner ? undefined : 360, // a folder with a banner sizes itself around it
        target: { kind: 'folder', path, trail, node, pick },
      });
      setHash(pick ? `${key}.${pick}` : key);
    },
    [open],
  );

  const openFolder = useCallback((f: Folder) => openFolderAt([f.id], [f.name], topFolderNode(f)), [openFolderAt]);

  const openItemAt = useCallback(
    (path: string[], item: ContentItem) => {
      const [w, h] = itemSize[item.type];
      const key = path.join('.');
      open(key, { title: itemWindowTitle(item), icon: item.icon ?? typeIcon[item.type], w, h, target: { kind: 'item', item } });
      setHash(key);
      if (item.type === 'image') {
        // Once the photo loads, narrow the window to the photo's shape so there are no black bars.
        const img = new Image();
        img.onload = () => {
          const imgW = Math.min(w - 10, window.innerHeight * 0.7 * (img.naturalWidth / img.naturalHeight));
          setWins((ws) => ws.map((x) => (x.key === key ? { ...x, w: Math.round(imgW + 10) } : x)));
        };
        img.src = item.src;
      }
    },
    [open],
  );

  // Shows another folder in an existing folder window, like Explorer does.
  // If that folder already has its own window, that one comes forward instead.
  const navigate = useCallback((fromKey: string, path: string[]) => {
    const target = folderTarget(path);
    if (!target) return;
    const key = path.join('.');
    setWins((ws) => {
      const z = topZ(ws) + 1;
      if (ws.some((w) => w.key === key)) {
        return ws.filter((w) => w.key !== fromKey).map((w) => (w.key === key ? { ...w, min: false, z } : w));
      }
      return ws.map((w) => (w.key === fromKey ? { ...w, key, title: target.node.name, icon: target.node.icon, target, z } : w));
    });
    setHash(key);
  }, []);

  // Opens a path from a link: the innermost folder, plus the item if the path ends on one.
  const openPath = useCallback(
    (path: string[]) => {
      let r = resolve(path);
      let rest: string | undefined;
      // A link to something that's gone falls back to the nearest folder that still exists.
      while (!r && path.length > 1) {
        rest = path[path.length - 1];
        path = path.slice(0, -1);
        r = resolve(path);
      }
      if (!r) return false;
      const depth = r.folders.length;
      const node = r.folders[depth - 1];
      // #books.shantaram: the bookshelf opens with that book pulled out
      openFolderAt(path.slice(0, depth), r.folders.map((f) => f.name), node, node.bookshelf || node.wardrobe || node.travel ? rest : undefined);
      if (r.item) openItemAt(path, r.item);
      return true;
    },
    [openFolderAt, openItemAt],
  );

  const openAbout = useCallback(() => {
    open('about', { title: `${site.handle} - Profile`, icon: 'computer', w: 720, target: { kind: 'about' } });
    setHash('about');
  }, [open]);

  // A friend with photos: #about.terry-snaps
  const openFriend = useCallback(
    (f: Friend) => {
      const key = `about.${friendSlug(f)}`;
      open(key, { title: `${f.name.split(' ')[0]}'s Photos`, icon: 'image', w: 640, h: 520, target: { kind: 'friend', friend: f } });
      setHash(key);
    },
    [open],
  );

  const openReadme = useCallback(() => {
    open('readme', { title: site.readme.title, icon: 'notepad', w: 440, h: 690, target: { kind: 'readme' } });
  }, [open]);

  const openWeather = useCallback(() => {
    open('weather', { title: 'Weather - Toronto', icon: 'weather', w: 460, target: { kind: 'weather' } });
    setHash('weather');
  }, [open]);

  const openSolitaire = useCallback(() => {
    open('solitaire', { title: 'Solitaire', icon: 'cards', w: 620, h: 500, target: { kind: 'solitaire' } });
    setHash('solitaire');
  }, [open]);

  const openMakeOwn = useCallback(() => {
    open('make-your-own', { title: 'Make Your Own.exe', icon: 'tools', w: 360, target: { kind: 'make-own' } });
    setHash('make-your-own');
  }, [open]);

  // Opens whatever the URL hash points at. Returns false if it points at nothing.
  const openFromHash = useCallback(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'about') {
      openAbout();
      return true;
    }
    const friend = site.friends.find((f) => f.photos?.length && h === `about.${friendSlug(f)}`);
    if (friend) {
      openFriend(friend);
      return true;
    }
    if (h === 'field') {
      setPage(1);
      return true;
    }
    if (h === 'readme') {
      openReadme();
      return true;
    }
    if (h === 'weather') {
      openWeather();
      return true;
    }
    if (h === 'solitaire') {
      openSolitaire();
      return true;
    }
    if (h === 'make-your-own') {
      openMakeOwn();
      return true;
    }
    return h ? openPath(unalias(h).split('.')) : false;
  }, [openAbout, openFriend, openReadme, openWeather, openSolitaire, openMakeOwn, openPath]);

  // Boot: open from the link, or show the readme on bigger screens.
  useEffect(() => {
    const boot = setTimeout(() => {
      if (!openFromHash()) {
        if (location.hash) setHash(''); // a link to something that's gone: just show the desktop
        if (!isNarrow()) openReadme();
      }
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
        return (
          <FolderView
            trail={t.trail}
            link={t.path.join('.')}
            blurb={t.node.blurb}
            banner={t.node.banner}
            bookshelf={t.node.bookshelf}
            wardrobe={t.node.wardrobe}
            travel={t.node.travel}
            onOpenPath={openPath}
            pick={t.pick}
            onPick={(id) => setHash([...t.path, ...(id ? [id] : [])].join('.'))}
            items={t.node.items}
            onOpenItem={(it) => {
              const path = [...t.path, it.id];
              if (it.type === 'folder') navigate(t.path.join('.'), path);
              else openItemAt(path, it);
            }}
            onBack={t.path.length > 1 ? () => navigate(t.path.join('.'), t.path.slice(0, -1)) : undefined}
          />
        );
      case 'item':
        return <ItemView it={t.item} />;
      case 'about':
        return <Profile onOpenPath={openPath} onOpenFriend={openFriend} />;
      case 'readme':
        return <ReadmeView readme={site.readme} />;
      case 'weather':
        return <WeatherView />;
      case 'solitaire':
        return <Solitaire />;
      case 'friend':
        return <FriendPhotos friend={t.friend} />;
      case 'make-own':
        return <MakeOwnView />;
    }
  }

  const desktopIcons: { id: string; icon: IconName; label: string; open: () => void }[] = [
    { id: 'about', icon: 'computer', label: "Rob's Computer", open: openAbout },
    { id: 'readme', icon: 'notepad', label: site.readme.title, open: openReadme },
    { id: 'solitaire', icon: 'cards', label: 'Solitaire', open: openSolitaire },
    ...visibleFolders.filter((f) => f.id !== 'recycle').map((f) => ({ id: f.id, icon: f.icon ?? ('folder' as IconName), label: f.name, open: () => openFolder(f) })),
    { id: 'make-your-own', icon: 'tools', label: 'Make Your Own.exe', open: openMakeOwn },
    ...visibleFolders.filter((f) => f.id === 'recycle').map((f) => ({ id: f.id, icon: f.icon ?? ('folder' as IconName), label: f.name, open: () => openFolder(f) })),
  ];

  return (
    <>
      <div
        id="desktop"
        ref={deskRef}
        style={{ transform: `translateX(${-page * 100}%)` }}
        onPointerDown={(e) => {
          const t = e.target as HTMLElement;
          if (t === e.currentTarget || t.id === 'icons') {
            setSelectedIcon(null);
            swipeX.current = e.clientX;
          }
        }}
        onPointerUp={(e) => {
          if (swipeX.current !== null && e.pointerType !== 'mouse' && e.clientX - swipeX.current < -60) goPage(page + 1);
          swipeX.current = null;
        }}
      >
        <Stickers stickers={site.stickers} />
        <div id="icons" role="list">
          {desktopIcons.map((d) => (
            // Trash lives in the top-right corner on bigger screens (see .trash-slot)
            <div key={d.id} role="listitem" className={d.id === 'recycle' ? 'trash-slot' : undefined}>
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

      {/* page 2: the field */}
      <div
        className="page-screen"
        style={{ transform: `translateX(${(1 - page) * 100}%)` }}
        aria-hidden={page !== 1}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).tagName === 'CANVAS') swipeX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeX.current !== null && e.pointerType !== 'mouse' && e.clientX - swipeX.current > 60) goPage(page - 1);
          swipeX.current = null;
        }}
      >
        <FieldPage active={page === 1} />
      </div>

      {page < PAGES.length - 1 && (
        <button type="button" className="page-arrow right" onClick={() => goPage(page + 1)} aria-label="Next screen" title="Next screen">
          ▶
        </button>
      )}
      {page > 0 && (
        <button type="button" className="page-arrow left" onClick={() => goPage(page - 1)} aria-label="Back to the desktop" title="Back">
          ◀
        </button>
      )}

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
        onWeather={openWeather}
        onSolitaire={openSolitaire}
        onMakeOwn={openMakeOwn}
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
