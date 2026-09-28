/**
 * Frame fetcher/decoder for /ascent. Off the main thread: fetch the encoded
 * frames in a progressive order (every 8th, then every 4th, then the rest), keep
 * the bytes, and decode with createImageBitmap on request. Requested frames jump
 * the fetch queue.
 *
 *   in:  { type: "init", urls }            urls[i] = frame i
 *        { type: "order", indices }        background fetch order
 *        { type: "want", indices }         decode these (nearest first)
 *   out: { type: "bitmap", i, bitmap }     (transferred)
 *        { type: "progress", loaded, count, coarse }
 */

let urls = [];
const blobs = new Map();
const fetching = new Set();
let queue = [];
let wants = [];
let active = 0;
const MAX = 4;
let coarseSet = new Set();
let coarseReported = false;

function progress() {
  let coarse = true;
  for (const i of coarseSet) if (!blobs.has(i)) coarse = false;
  if (coarse && !coarseReported) coarseReported = true;
  self.postMessage({ type: "progress", loaded: blobs.size, count: urls.length, coarse });
}

async function decode(i) {
  const b = blobs.get(i);
  if (!b) return;
  try {
    const bitmap = await createImageBitmap(b);
    self.postMessage({ type: "bitmap", i, bitmap }, [bitmap]);
  } catch {
    self.postMessage({ type: "error", i });
  }
}

function pump() {
  while (active < MAX) {
    let i = -1;
    while (wants.length) {
      const w = wants.shift();
      if (!blobs.has(w) && !fetching.has(w)) {
        i = w;
        break;
      }
    }
    if (i < 0) {
      while (queue.length) {
        const q = queue.shift();
        if (!blobs.has(q) && !fetching.has(q)) {
          i = q;
          break;
        }
      }
    }
    if (i < 0) return;
    active += 1;
    fetching.add(i);
    fetch(urls[i])
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        blobs.set(i, b);
        if (pendingDecode.has(i)) {
          pendingDecode.delete(i);
          decode(i);
        }
        progress();
      })
      .catch(() => {})
      .finally(() => {
        active -= 1;
        fetching.delete(i);
        pump();
      });
  }
}

const pendingDecode = new Set();

self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "init") {
    urls = m.urls;
    coarseSet = new Set(m.coarse || []);
  } else if (m.type === "order") {
    queue = m.indices.slice();
    pump();
  } else if (m.type === "want") {
    const fresh = [];
    for (const i of m.indices) {
      if (blobs.has(i)) decode(i);
      else {
        pendingDecode.add(i);
        fresh.push(i);
      }
    }
    wants = fresh.concat(wants.filter((w) => !fresh.includes(w)));
    pump();
  }
};
