'use client';

import { useState } from 'react';
import type { MapItem } from '@/content';
import { MenuBar } from './viewers';

const search = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const embedFor = (q: string, zoom?: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(q)}${zoom ? `&z=${zoom}` : ''}&output=embed`;

// Turns a Google Maps link into something that can sit in an iframe, when possible.
// Saved lists (maps.app.goo.gl share links) can't be embedded, so they return null.
function embedFromUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/maps/embed')) return url;
    if (u.pathname.startsWith('/maps/d/')) return url.replace(/\/maps\/d\/(u\/\d+\/)?(viewer|edit)/, '/maps/d/$1embed');
    const at = u.pathname.match(/@(-?[\d.]+),(-?[\d.]+),([\d.]+)z/);
    if (at) return embedFor(`${at[1]},${at[2]}`, String(Math.round(+at[3])));
    const q = u.searchParams.get('q') ?? u.searchParams.get('query');
    if (q) return embedFor(q);
    const place = u.pathname.match(/\/maps\/(place|search)\/([^/]+)/);
    if (place) return embedFor(decodeURIComponent(place[2].replace(/\+/g, ' ')));
  } catch {}
  return null;
}

export default function MapView({ it }: { it: MapItem }) {
  const places = it.places ?? [];
  const [sel, setSel] = useState<number | null>(null);
  const place = sel === null ? null : places[sel];
  const fromUrl = it.url ? embedFromUrl(it.url) : null;
  const src = place
    ? embedFor(place.query ?? place.name)
    : (fromUrl ?? (it.area ? embedFor(it.area) : null) ?? (places[0] ? embedFor(places[0].query ?? places[0].name) : null));
  const openHref = place ? search(place.query ?? place.name) : (it.url ?? (places[0] ? search(places[0].query ?? places[0].name) : '#'));

  return (
    <>
      <MenuBar items={['File', 'Edit', 'View', 'Places', 'Help']} />
      <div className="addr">
        <span>Address</span>
        <div className="sunken">{place ? place.name : (it.url ?? it.title)}</div>
        <a className="bevel btnlink small" href={openHref} target="_blank" rel="noopener noreferrer">
          Open in Google Maps ↗
        </a>
      </div>
      <div className={`sunken scroll mapwrap${places.length ? ' withlist' : ''}`}>
        {src ? (
          <iframe className="gmap" src={src} title={`Map: ${place?.name ?? it.title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <div className="browse">
            <div className="hero">
              <h2>{it.title}</h2>
              <p style={{ margin: 0 }}>Saved Google Maps lists open in Google Maps.</p>
            </div>
          </div>
        )}
        {places.length > 0 && (
          <ol className="places">
            {places.map((p, i) => (
              <li key={i}>
                <button type="button" className={i === sel ? 'on' : undefined} onClick={() => setSel(i)}>
                  <b>{p.name}</b>
                  {p.note && <span>{p.note}</span>}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      {it.note && <p className="caption">{it.note}</p>}
    </>
  );
}
