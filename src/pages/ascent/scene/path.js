import { terrainH, valleyX } from "./terrain";

/**
 * The route up the mountain, and where the camera looks along it.
 *
 * Ground route: up the glacier valley's centre line, then straight up the
 * south face to the summit. The camera rides a little above it; everything is
 * sampled from the same height function the GPU draws, then smoothed so the
 * camera never jitters over a serac.
 */

const FACE_Z = 950;

/** Ground route point at "route z" (z decreasing as we climb). */
export function routeXZ(z) {
  if (z >= FACE_Z) return [valleyX(z), z];
  const x0 = valleyX(FACE_Z);
  return [x0 * (z / FACE_Z), z];
}

/** Highest ground within `r` of (x, z): the camera clears boulders, not just the centre. */
function groundAt(x, z, r = 10) {
  let h = terrainH(x, z);
  for (let a = 0; a < 6; a++) {
    const t = (a / 6) * Math.PI * 2;
    h = Math.max(h, terrainH(x + Math.cos(t) * r, z + Math.sin(t) * r));
  }
  return h;
}

/* Camps along p. z = where on the route; eye = height above ground; look = target. */
const CAMPS = [
  { p: 0, z: 3080, eye: 16 },
  { p: 1, z: 2440, eye: 13 },
  { p: 2, z: 1660, eye: 15 },
  { p: 3, z: 990, eye: 16 },
  { p: 4, z: 330, eye: 18 },
  { p: 5, z: 30, eye: 34 },
];

/** Route z at p (piecewise linear between camps; the spline smooths the corners). */
function zAt(p) {
  if (p <= 0) return CAMPS[0].z;
  if (p >= 5) return CAMPS[5].z;
  const i = Math.floor(p);
  const f = p - i;
  return CAMPS[i].z + (CAMPS[i + 1].z - CAMPS[i].z) * f;
}
function eyeAt(p) {
  if (p <= 0) return CAMPS[0].eye;
  if (p >= 5) return CAMPS[5].eye;
  const i = Math.floor(p);
  const f = p - i;
  return CAMPS[i].eye + (CAMPS[i + 1].eye - CAMPS[i].eye) * f;
}

/**
 * Dense camera samples for p ∈ [0, 6]. Past the summit (5 → 6) the camera
 * lifts off the top and drifts back, to look down over the sea of cloud.
 */
export function cameraSamples(step = 0.05) {
  const pts = [];
  for (let p = 0; p <= 6 + 1e-6; p += step) {
    if (p <= 5) {
      const z = zAt(p);
      const [x, zz] = routeXZ(z);
      pts.push([x, groundAt(x, zz) + eyeAt(p), zz]);
    } else {
      const f = p - 5;
      const [x, z] = routeXZ(CAMPS[5].z);
      const top = groundAt(x, z) + CAMPS[5].eye;
      pts.push([x - 160 * f, top + 120 * f, z + 260 * f]);
    }
  }
  // smooth heights (the ground is rough; the climb should not be)
  const ys = pts.map((q) => q[1]);
  for (let i = 0; i < pts.length; i++) {
    let s = 0;
    let n = 0;
    for (let k = -2; k <= 2; k++) {
      const j = i + k;
      if (j < 0 || j >= pts.length) continue;
      s += ys[j];
      n += 1;
    }
    pts[i][1] = Math.max(ys[i], s / n);
  }
  return pts;
}

/** Look targets per camp (p = 0..6). */
export function lookTargets() {
  const g = (x, z) => terrainH(x, z);
  return [
    [110, 330, 1350], // base camp: the wall of the mountain ahead
    [valleyX(1760), g(valleyX(1760), 1760) + 40, 1760], // icefall: up through the seracs
    [120, 820, 560], // basin: the face, somewhere in the white
    [70, 1180, 420], // rope: up the face
    [0, 2150, -260], // high zone: summit and stars
    [3000, 1720, -620], // summit: the sunrise
    [2600, 780, -500], // below: over the sea of cloud
  ];
}

/** Anchor points of the fixed rope, up the face. */
export function ropePoints() {
  const pts = [];
  for (let z = 960; z >= 340; z -= 10) {
    const [x, zz] = routeXZ(z);
    const off = 7; // the rope runs a few metres beside the camera line
    const xs = x + off;
    pts.push([xs, terrainH(xs, zz) + 1.6, zz]);
  }
  return pts;
}

export { groundAt };
