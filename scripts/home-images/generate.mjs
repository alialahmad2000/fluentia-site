#!/usr/bin/env node
/**
 * generate — render homepage shots from shots.json with FAL (FLUX Pro v1.1 ultra).
 *
 *   FAL_API_KEY=… RAW_DIR=/scratch/raw node scripts/home-images/generate.mjs <id> [count=1] [--seed N] [--raw]
 *   FAL_API_KEY=… RAW_DIR=/scratch/raw node scripts/home-images/generate.mjs --all [count=2]
 *
 * --all walks shots.json `renderOrder`. Raw renders are large and are NOT
 * committed: they land in RAW_DIR as <id>--<seed>.jpg, and every request (paid
 * or refused) is appended to RAW_DIR/ledger.jsonl. The run refuses to start a
 * render once the ledger holds MAX_RENDERS successful ones (default 45), and
 * stops at the first balance/lock error rather than retrying. --raw forces
 * ultra's raw mode (less processed, more photographic) for this call.
 * The key is read from the environment only; never write it into this repo.
 * Next: sheet.mjs (contact sheet) → review → pick.mjs → optimise.mjs.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KEY = process.env.FAL_API_KEY;
if (!KEY) throw new Error("FAL_API_KEY is not set");
const RAW = process.env.RAW_DIR || join(tmpdir(), "fluentia-home-raw");
const MAX = Number(process.env.MAX_RENDERS || 45);
mkdirSync(RAW, { recursive: true });
const LEDGER = join(RAW, "ledger.jsonl");

const manifest = JSON.parse(readFileSync(new URL("./shots.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const seedAt = args.indexOf("--seed");
const fixedSeed = seedAt > -1 ? Number(args[seedAt + 1]) : undefined;
const positional = args.filter((a, i) => !a.startsWith("--") && i !== seedAt + 1);

const used = () =>
  existsSync(LEDGER)
    ? readFileSync(LEDGER, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.status === 200).length
    : 0;

async function render(shot, seed) {
  if (used() >= MAX) throw new Error(`render budget reached: ${used()} of ${MAX} in ${LEDGER}`);
  const prompt = `${shot.prompt} ${manifest.suffix}`;
  const body = {
    prompt,
    aspect_ratio: shot.aspect_ratio,
    raw: flag("--raw") || Boolean(shot.raw),
    num_images: 1,
    output_format: "jpeg",
    safety_tolerance: "2",
    enable_safety_checker: true,
  };
  if (seed !== undefined) body.seed = seed;
  const res = await fetch(`https://fal.run/${shot.model}`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  appendFileSync(LEDGER, JSON.stringify({ at: new Date().toISOString(), id: shot.id, status: res.status }) + "\n");
  if (!res.ok) {
    // A locked or empty balance is not retried and not routed elsewhere: stop and report.
    throw new Error(`FAL ${res.status} for ${shot.id}: ${text.slice(0, 300)}`);
  }
  const j = JSON.parse(text);
  const img = j.images?.[0];
  if (!img?.url) throw new Error(`FAL returned no image for ${shot.id}: ${text.slice(0, 300)}`);
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer());
  const file = join(RAW, `${shot.id}--${j.seed}.jpg`);
  writeFileSync(file, buf);
  const r = { id: shot.id, file, seed: j.seed, width: img.width, height: img.height, nsfw: j.has_nsfw_concepts, used: `${used()}/${MAX}` };
  console.log(JSON.stringify(r));
  return r;
}

const byId = (id) => {
  const s = manifest.shots.find((x) => x.id === id);
  if (!s) throw new Error(`no shot "${id}" in shots.json`);
  return s;
};

if (flag("--all")) {
  const count = Math.max(1, Math.min(4, Number(positional[0]) || 2));
  for (const id of manifest.renderOrder) for (let i = 0; i < count; i++) await render(byId(id));
} else {
  const [id, countArg] = positional;
  if (!id) throw new Error("usage: generate.mjs <id> [count] | --all [count]");
  const count = Math.max(1, Math.min(4, Number(countArg) || 1));
  for (let i = 0; i < count; i++) await render(byId(id), fixedSeed);
}
