/* eslint-disable @typescript-eslint/no-require-imports -- a one-off Node script, not site code */
// Rebuilds components/desktop/worldMap.ts's grid. Run from a scratch folder with:
//   npm i topojson-client d3-geo && curl -O https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json && node make-world-map.cjs
// then run-length encode grid.txt into worldMap.ts (see the comment there).

const topo = require('topojson-client');
const d3 = require('d3-geo');
const t = require('./countries-50m.json');
const fc = topo.feature(t, t.objects.countries);
const visited = new Set(['Antigua and Barb.','Australia','Barbados','Belgium','Cambodia','Canada','Colombia','Croatia','Czechia','Denmark','Dominican Rep.','Estonia','Finland','France','Germany','Greece','Hungary','Iceland','Indonesia','Ireland','Italy','Jamaica','Japan','Laos','Latvia','Malaysia','Mexico','Monaco','Netherlands','Norway','Poland','Portugal','Russia','Singapore','South Korea','Spain','St-Martin','Sweden','Switzerland','Thailand','Bahamas','Turkey','United Kingdom','United States of America','Vatican','Vietnam','Morocco']);
const names = fc.features.map(f => f.properties.name);
for (const v of visited) if (!names.includes(v)) console.error('MISSING', v);
const feats = fc.features.filter(f => f.properties.name !== 'Antarctica').map(f => ({ f, b: d3.geoBounds(f), v: visited.has(f.properties.name) }));
const STEP = 1.5, LAT0 = 82, LAT1 = -58;
const W = Math.round(360 / STEP), H = Math.round((LAT0 - LAT1) / STEP);
const rows = [];
for (let r = 0; r < H; r++) {
  let row = '';
  const lat = LAT0 - (r + 0.5) * STEP;
  for (let c = 0; c < W; c++) {
    const lon = -180 + (c + 0.5) * STEP;
    let ch = '.';
    for (const { f, b, v } of feats) {
      const [[x0, y0], [x1, y1]] = b;
      const inLon = x0 <= x1 ? lon >= x0 && lon <= x1 : lon >= x0 || lon <= x1;
      if (!inLon || lat < y0 || lat > y1) continue;
      if (d3.geoContains(f, [lon, lat])) { ch = v ? 'v' : 'l'; break; }
    }
    row += ch;
  }
  rows.push(row);
}
require('fs').writeFileSync('grid.txt', rows.join('\n'));
console.log(W, H, rows.join('').split('').filter(c => c === 'v').length, 'visited cells');
