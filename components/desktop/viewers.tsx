import type { IconName, Item, ItemType, VideoItem } from '@/content';
import { PauseGlyph, PlayGlyph, StopGlyph } from './icons';

export const typeIcon: Record<ItemType, IconName> = {
  note: 'notepad',
  recipe: 'recipe',
  link: 'globe',
  video: 'film',
  list: 'book',
  image: 'image',
};

const appName: Record<ItemType, string> = {
  note: 'Notepad',
  recipe: 'Recipe Card',
  link: 'Internet Explorer',
  video: 'Media Player',
  list: 'Contents',
  image: 'Photo Viewer',
};

export const itemSize: Record<ItemType, [number, number | undefined]> = {
  recipe: [620, 520],
  note: [440, 320],
  link: [520, 330],
  video: [560, undefined],
  list: [460, 300],
  image: [560, 440],
};

export function itemWindowTitle(it: Item) {
  const name = it.type === 'note' && !/\.txt$/i.test(it.title) ? `${it.title}.txt` : it.title;
  return `${name} - ${appName[it.type]}`;
}

export function MenuBar({ items }: { items: string[] }) {
  return (
    <div className="menubar" aria-hidden="true">
      {items.map((m) => (
        <span key={m}>{m}</span>
      ))}
    </div>
  );
}

export function Notepad({ body, date }: { body: string; date?: string }) {
  return (
    <>
      <MenuBar items={['File', 'Edit', 'Search', 'Help']} />
      <div className="sunken scroll">
        <div className="notepad">
          {date && (
            <>
              <span className="date">{date}</span>
              {'\n\n'}
            </>
          )}
          {body}
        </div>
      </div>
    </>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Returns a YouTube video id for watch, youtu.be, shorts and embed links; null otherwise.
function youtubeId(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m)\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1) || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]+)/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

function VideoPlayer({ it }: { it: VideoItem }) {
  const id = youtubeId(it.url);
  return (
    <>
      {id ? (
        <div className="player">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
            title={it.title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : (
        <a className="player" href={it.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${it.title}`}>
          <span className="osd">▶ PLAY</span>
          <span className="play">
            <PlayGlyph />
          </span>
        </a>
      )}
      <div className="transport" aria-hidden="true">
        <span className="bevel">
          <PlayGlyph fill="#000" />
        </span>
        <span className="bevel">
          <PauseGlyph />
        </span>
        <span className="bevel">
          <StopGlyph />
        </span>
        <span className="bar sunken" />
      </div>
      <p className="caption">
        {it.note}
        {it.note && ' '}
        <a href={it.url} target="_blank" rel="noopener noreferrer">
          Open on {hostOf(it.url)} ↗
        </a>
      </p>
    </>
  );
}

export function ItemView({ it }: { it: Item }) {
  switch (it.type) {
    case 'note':
      return <Notepad body={it.body} date={it.date} />;

    case 'recipe':
      return (
        <div className="sunken scroll">
          <div className="doc">
            <h2>{it.title}</h2>
            <div className="meta">
              {it.serves && (
                <span>
                  <b>Serves</b> {it.serves}
                </span>
              )}
              {it.time && (
                <span>
                  <b>Time</b> {it.time}
                </span>
              )}
              {it.source && (
                <a href={it.source} target="_blank" rel="noopener noreferrer">
                  Original recipe
                </a>
              )}
            </div>
            <div className="rgrid">
              <div>
                <h3>Ingredients</h3>
                <ul className="ing">
                  {it.ingredients.map((x, i) => (
                    <li key={i}>
                      <label>
                        <input type="checkbox" />
                        <span>{x}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Method</h3>
                <ol className="steps">
                  {it.steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </div>
            </div>
            {it.note && <p className="redline">{it.note}</p>}
          </div>
        </div>
      );

    case 'link':
      return (
        <>
          <MenuBar items={['File', 'Edit', 'View', 'Go', 'Favorites', 'Help']} />
          <div className="addr">
            <span>Address</span>
            <div className="sunken">{it.url}</div>
          </div>
          <div className="sunken scroll browse">
            <div className="hero">
              <div className="host">{hostOf(it.url)}</div>
              <h2>{it.title}</h2>
              {it.note && <p style={{ margin: 0 }}>{it.note}</p>}
              <a className="btnlink bevel" href={it.url} target="_blank" rel="noopener noreferrer">
                Visit site ↗
              </a>
            </div>
          </div>
        </>
      );

    case 'video':
      return <VideoPlayer it={it} />;

    case 'list':
      return (
        <div className="sunken scroll" style={{ background: 'var(--paper)' }}>
          <table className="ltable">
            <tbody>
              {it.rows.map((r, i) => (
                <tr key={i}>
                  <th>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        {r.name}
                      </a>
                    ) : (
                      r.name
                    )}
                  </th>
                  <td>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'image':
      return (
        <>
          <div className="sunken scroll photo">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img so any path or URL in content.ts just works */}
            <img src={it.src} alt={it.caption || it.title} />
          </div>
          {it.caption && <p className="caption">{it.caption}</p>}
        </>
      );
  }
}
