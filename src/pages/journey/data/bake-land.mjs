/**
 * bake-land — turns Natural Earth 110m land (public domain) into the two dot
 * grids /journey draws: the whole globe, and the Gulf region for the footer map.
 * Not imported by the app. Re-run by hand:
 *   curl -sLO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
 *   node src/pages/journey/data/bake-land.mjs ne_110m_land.geojson
 *
 * Format (both files): { step, lat0, rows: "..." } where each row is
 * "<latIndex>:<lonIndex>,<lonIndex>…" joined by ";" — lat = lat0 + i*step,
 * and on the globe the lon step widens with 1/cos(lat) so dots stay evenly spaced.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const geo = JSON.parse(readFileSync(process.argv[2], "utf8"));

const rings = [];
for (const f of geo.features) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const p of polys) rings.push(p);
}
function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function isLand(lon, lat) {
  for (const poly of rings) {
    if (!inRing(lon, lat, poly[0])) continue;
    let hole = false;
    for (let h = 1; h < poly.length; h++) if (inRing(lon, lat, poly[h])) hole = true;
    if (!hole) return true;
  }
  return false;
}

// Globe: 1° rows from -58° (no Antarctica) to 80°.
{
  const step = 1.0;
  const lat0 = -58;
  const rows = [];
  let n = 0;
  for (let i = 0; lat0 + i * step <= 80; i++) {
    const lat = lat0 + i * step;
    const lonStep = step / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
    const cols = [];
    for (let k = 0; -180 + k * lonStep < 180; k++) if (isLand(-180 + k * lonStep, lat)) cols.push(k);
    if (cols.length) rows.push(`${i}:${cols.join(",")}`);
    n += cols.length;
  }
  const json = JSON.stringify({ step, lat0, rows: rows.join(";") });
  writeFileSync(join(OUT, "globe-dots.json"), json);
  console.log("globe", n, "dots", json.length, "bytes");
}

// Region (footer map): Red Sea → Gulf, 0.45° square grid, lat 12..34, lon 32..60.
{
  const step = 0.45;
  const lat0 = 12;
  const lon0 = 32;
  const rows = [];
  let n = 0;
  for (let i = 0; lat0 + i * step <= 34; i++) {
    const lat = lat0 + i * step;
    const cols = [];
    for (let k = 0; lon0 + k * step <= 60; k++) if (isLand(lon0 + k * step, lat)) cols.push(k);
    if (cols.length) rows.push(`${i}:${cols.join(",")}`);
    n += cols.length;
  }
  const json = JSON.stringify({ step, lat0, lon0, rows: rows.join(";") });
  writeFileSync(join(OUT, "region-dots.json"), json);
  console.log("region", n, "dots", json.length, "bytes");
}
