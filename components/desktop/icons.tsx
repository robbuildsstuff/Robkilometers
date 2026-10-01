import type { IconName } from '@/content';
import { cityArt, palette, type CityIconName } from './cityIcons';

// Pixel icons on a 32x32 grid. Markup is static and authored here, never from content.
const baseArt: Record<Exclude<IconName, CityIconName>, string> = {
  folder:
    '<rect x="3" y="6" width="11" height="4" fill="#7a5c00"/><rect x="4" y="7" width="9" height="3" fill="#e0b940"/><rect x="2" y="9" width="28" height="19" fill="#7a5c00"/><rect x="3" y="10" width="26" height="17" fill="#f2cf5b"/><rect x="3" y="10" width="26" height="2" fill="#fff0a8"/><rect x="3" y="25" width="26" height="2" fill="#c9a227"/>',
  trash:
    '<rect x="7" y="7" width="18" height="3" fill="#333"/><rect x="13" y="5" width="6" height="2" fill="#333"/><rect x="8" y="10" width="16" height="18" fill="#333"/><rect x="9" y="10" width="14" height="17" fill="#d8d8d8"/><rect x="11" y="12" width="2" height="13" fill="#8a8a8a"/><rect x="15" y="12" width="2" height="13" fill="#8a8a8a"/><rect x="19" y="12" width="2" height="13" fill="#8a8a8a"/><rect x="9" y="10" width="14" height="2" fill="#fff"/>',
  computer:
    '<rect x="5" y="3" width="22" height="18" fill="#222"/><rect x="6" y="4" width="20" height="16" fill="#c3c3c3"/><rect x="8" y="6" width="16" height="11" fill="#0b0a6e"/><rect x="9" y="7" width="7" height="3" fill="#2a7a78"/><rect x="12" y="21" width="8" height="2" fill="#555"/><rect x="4" y="23" width="24" height="6" fill="#222"/><rect x="5" y="24" width="22" height="4" fill="#c3c3c3"/><rect x="7" y="25" width="12" height="1" fill="#555"/><rect x="23" y="25" width="2" height="1" fill="#1c1"/>',
  notepad:
    '<rect x="6" y="3" width="21" height="26" fill="#222"/><rect x="7" y="4" width="19" height="24" fill="#fff"/><rect x="7" y="4" width="19" height="4" fill="#3a6fd8"/><rect x="9" y="3" width="2" height="3" fill="#aaa"/><rect x="14" y="3" width="2" height="3" fill="#aaa"/><rect x="19" y="3" width="2" height="3" fill="#aaa"/><rect x="9" y="11" width="14" height="1" fill="#777"/><rect x="9" y="15" width="14" height="1" fill="#777"/><rect x="9" y="19" width="11" height="1" fill="#777"/><rect x="9" y="23" width="13" height="1" fill="#777"/>',
  recipe:
    '<rect x="3" y="7" width="26" height="19" fill="#5a4a2a"/><rect x="4" y="8" width="24" height="17" fill="#fffbe8"/><rect x="4" y="11" width="24" height="1" fill="#c8201a"/><rect x="6" y="14" width="18" height="1" fill="#8ab"/><rect x="6" y="17" width="18" height="1" fill="#8ab"/><rect x="6" y="20" width="12" height="1" fill="#8ab"/><rect x="21" y="18" width="5" height="5" fill="#c8201a"/><rect x="22" y="17" width="3" height="1" fill="#3a8a2a"/>',
  globe:
    '<rect x="10" y="4" width="12" height="24" fill="#1a3a9a"/><rect x="6" y="7" width="20" height="18" fill="#1a3a9a"/><rect x="4" y="10" width="24" height="12" fill="#1a3a9a"/><rect x="11" y="5" width="10" height="22" fill="#3a8ae8"/><rect x="7" y="8" width="18" height="16" fill="#3a8ae8"/><rect x="5" y="11" width="22" height="10" fill="#3a8ae8"/><rect x="9" y="9" width="6" height="5" fill="#3ab84a"/><rect x="7" y="12" width="5" height="4" fill="#3ab84a"/><rect x="17" y="15" width="7" height="6" fill="#3ab84a"/><rect x="19" y="21" width="3" height="3" fill="#3ab84a"/><rect x="11" y="6" width="5" height="1" fill="#bfe0ff"/>',
  film:
    '<rect x="3" y="6" width="26" height="20" fill="#111"/><rect x="5" y="7" width="2" height="2" fill="#ddd"/><rect x="9" y="7" width="2" height="2" fill="#ddd"/><rect x="13" y="7" width="2" height="2" fill="#ddd"/><rect x="17" y="7" width="2" height="2" fill="#ddd"/><rect x="21" y="7" width="2" height="2" fill="#ddd"/><rect x="25" y="7" width="2" height="2" fill="#ddd"/><rect x="5" y="23" width="2" height="2" fill="#ddd"/><rect x="9" y="23" width="2" height="2" fill="#ddd"/><rect x="13" y="23" width="2" height="2" fill="#ddd"/><rect x="17" y="23" width="2" height="2" fill="#ddd"/><rect x="21" y="23" width="2" height="2" fill="#ddd"/><rect x="25" y="23" width="2" height="2" fill="#ddd"/><rect x="5" y="10" width="22" height="12" fill="#2a7a78"/><rect x="13" y="12" width="2" height="8" fill="#fff"/><rect x="15" y="13" width="2" height="6" fill="#fff"/><rect x="17" y="14" width="2" height="4" fill="#fff"/><rect x="19" y="15" width="1" height="2" fill="#fff"/>',
  book:
    '<rect x="4" y="21" width="24" height="6" fill="#222"/><rect x="5" y="22" width="22" height="4" fill="#c8201a"/><rect x="5" y="25" width="22" height="1" fill="#fff"/><rect x="6" y="14" width="22" height="7" fill="#222"/><rect x="7" y="15" width="20" height="5" fill="#1a3a9a"/><rect x="7" y="19" width="20" height="1" fill="#fff"/><rect x="5" y="7" width="20" height="7" fill="#222"/><rect x="6" y="8" width="18" height="5" fill="#3a8a2a"/><rect x="6" y="12" width="18" height="1" fill="#fff"/><rect x="10" y="9" width="8" height="1" fill="#e6d98a"/>',
  image:
    '<rect x="3" y="6" width="26" height="20" fill="#222"/><rect x="4" y="7" width="24" height="18" fill="#9fd4ff"/><rect x="20" y="9" width="4" height="4" fill="#ffd23a"/><rect x="4" y="19" width="24" height="6" fill="#3a8a2a"/><rect x="8" y="15" width="8" height="4" fill="#3a8a2a"/><rect x="10" y="13" width="4" height="2" fill="#3a8a2a"/>',
  mail:
    '<rect x="3" y="8" width="26" height="17" fill="#222"/><rect x="4" y="9" width="24" height="15" fill="#fffbe8"/><rect x="5" y="10" width="2" height="1" fill="#222"/><rect x="7" y="11" width="2" height="1" fill="#222"/><rect x="9" y="12" width="2" height="1" fill="#222"/><rect x="11" y="13" width="2" height="1" fill="#222"/><rect x="13" y="14" width="6" height="1" fill="#222"/><rect x="19" y="13" width="2" height="1" fill="#222"/><rect x="21" y="12" width="2" height="1" fill="#222"/><rect x="23" y="11" width="2" height="1" fill="#222"/><rect x="25" y="10" width="2" height="1" fill="#222"/><rect x="22" y="17" width="4" height="5" fill="#c8201a"/>',
  camera:
    '<rect x="3" y="9" width="26" height="17" fill="#222"/><rect x="4" y="10" width="24" height="15" fill="#c86a9a"/><rect x="8" y="7" width="7" height="3" fill="#222"/><rect x="11" y="12" width="10" height="10" fill="#222"/><rect x="12" y="13" width="8" height="8" fill="#eee"/><rect x="14" y="15" width="4" height="4" fill="#222"/><rect x="23" y="12" width="3" height="2" fill="#ffd23a"/>',
  music:
    '<rect x="11" y="5" width="3" height="18" fill="#222"/><rect x="14" y="5" width="12" height="3" fill="#222"/><rect x="23" y="8" width="3" height="12" fill="#222"/><rect x="5" y="20" width="9" height="7" fill="#1db954"/><rect x="17" y="17" width="9" height="7" fill="#1db954"/><rect x="5" y="20" width="9" height="1" fill="#222"/><rect x="17" y="17" width="9" height="1" fill="#222"/>',
  km: '<rect x="4" y="3" width="24" height="20" fill="#0a0a0a"/><rect x="5" y="4" width="22" height="18" fill="#1a7a3a"/><rect x="6" y="5" width="20" height="16" fill="#fff"/><rect x="7" y="6" width="18" height="14" fill="#1a7a3a"/><rect x="9" y="9" width="2" height="8" fill="#fff"/><rect x="11" y="12" width="1" height="2" fill="#fff"/><rect x="12" y="11" width="1" height="1" fill="#fff"/><rect x="12" y="14" width="1" height="1" fill="#fff"/><rect x="13" y="10" width="1" height="1" fill="#fff"/><rect x="13" y="15" width="1" height="2" fill="#fff"/><rect x="15" y="12" width="1" height="5" fill="#fff"/><rect x="16" y="12" width="2" height="1" fill="#fff"/><rect x="18" y="13" width="1" height="4" fill="#fff"/><rect x="19" y="12" width="2" height="1" fill="#fff"/><rect x="21" y="13" width="1" height="4" fill="#fff"/><rect x="15" y="23" width="2" height="7" fill="#555"/>',
  shutdown:
    '<rect x="5" y="4" width="22" height="16" fill="#222"/><rect x="6" y="5" width="20" height="14" fill="#c3c3c3"/><rect x="8" y="7" width="16" height="10" fill="#111"/><rect x="11" y="20" width="10" height="3" fill="#555"/><rect x="6" y="23" width="20" height="4" fill="#222"/><rect x="7" y="24" width="18" height="2" fill="#c3c3c3"/><rect x="21" y="24" width="3" height="1" fill="#c8201a"/>',
  runner:
    '<rect x="17" y="3" width="5" height="5" fill="#3a2a1a"/><rect x="18" y="4" width="4" height="4" fill="#e0a878"/><rect x="13" y="9" width="7" height="8" fill="#1a7a3a"/><rect x="20" y="10" width="5" height="2" fill="#e0a878"/><rect x="24" y="8" width="2" height="3" fill="#e0a878"/><rect x="8" y="12" width="5" height="2" fill="#e0a878"/><rect x="7" y="14" width="2" height="3" fill="#e0a878"/><rect x="14" y="17" width="6" height="3" fill="#222"/><rect x="18" y="20" width="3" height="4" fill="#e0a878"/><rect x="20" y="23" width="3" height="3" fill="#e0a878"/><rect x="20" y="26" width="6" height="2" fill="#e9631a"/><rect x="12" y="20" width="3" height="3" fill="#e0a878"/><rect x="9" y="22" width="4" height="3" fill="#e0a878"/><rect x="5" y="23" width="5" height="2" fill="#e9631a"/>',
  tools:
    '<rect x="7" y="4" width="18" height="7" fill="#222"/><rect x="8" y="5" width="16" height="5" fill="#8a8a8a"/><rect x="8" y="5" width="16" height="1" fill="#d8d8d8"/><rect x="13" y="11" width="6" height="18" fill="#222"/><rect x="14" y="11" width="4" height="17" fill="#a0642a"/><rect x="14" y="11" width="1" height="17" fill="#c88a4a"/>',
  map: '<rect x="3" y="7" width="26" height="20" fill="#222"/><rect x="4" y="8" width="8" height="18" fill="#e8e2c4"/><rect x="12" y="8" width="8" height="18" fill="#d4cda8"/><rect x="20" y="8" width="8" height="18" fill="#e8e2c4"/><rect x="4" y="16" width="24" height="2" fill="#f2cf5b"/><rect x="15" y="8" width="2" height="18" fill="#9fd4ff"/><rect x="18" y="2" width="8" height="8" fill="#8a1410"/><rect x="19" y="3" width="6" height="6" fill="#e0301e"/><rect x="21" y="5" width="2" height="2" fill="#fff"/><rect x="20" y="10" width="4" height="2" fill="#8a1410"/><rect x="21" y="12" width="2" height="3" fill="#8a1410"/>',
};

// Turns a 16x16 letter grid into rects, merging runs of the same colour on a row.
export function gridToRects(grid: string) {
  return grid
    .trim()
    .split('\n')
    .flatMap((row, y) => {
      const rects: string[] = [];
      for (let x = 0; x < row.length; ) {
        const ch = row[x];
        let end = x + 1;
        while (end < row.length && row[end] === ch) end++;
        if (palette[ch]) rects.push(`<rect x="${x * 2}" y="${y * 2}" width="${(end - x) * 2}" height="2" fill="${palette[ch]}"/>`);
        x = end;
      }
      return rects;
    })
    .join('');
}

const art: Record<IconName, string> = {
  ...baseArt,
  ...(Object.fromEntries(Object.entries(cityArt).map(([k, grid]) => [k, gridToRects(grid)])) as Record<CityIconName, string>),
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: art[name] }}
    />
  );
}

// Small title-bar glyphs on an 8x8 grid.
export function MinGlyph() {
  return (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="6" width="6" height="2" fill="#000" />
    </svg>
  );
}

export function MaxGlyph() {
  return (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="0" width="8" height="8" fill="#000" />
      <rect x="1" y="2" width="6" height="5" fill="#c3c3c3" />
    </svg>
  );
}

export function CloseGlyph() {
  return (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v2h1v1h1v1h1v1H6V7H5V6H3v1H2v1H0V7h1V6h1V5h1V3H2V2H1V1H0z"
        fill="#000"
      />
    </svg>
  );
}

export function PlayGlyph({ fill = '#eee' }: { fill?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M0 0L10 6L0 12Z" fill={fill} />
    </svg>
  );
}

export function PauseGlyph() {
  return (
    <svg viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="1" width="3" height="8" fill="#000" />
      <rect x="6" y="1" width="3" height="8" fill="#000" />
    </svg>
  );
}

export function StopGlyph() {
  return (
    <svg viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" fill="#000" />
    </svg>
  );
}

// Draws a 16x16 letter grid (see cityIcons.ts) as a crisp little picture.
export function GridIcon({ grid, className }: { grid: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: gridToRects(grid) }}
    />
  );
}
