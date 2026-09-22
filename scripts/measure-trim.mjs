#!/usr/bin/env node
/**
 * Finds the real edges of each artwork inside its file.
 *
 * The source export letterboxes most paintings onto a white canvas, which
 * shows as white bars around the work. This records the bounding box of the
 * actual content so the site can crop to it in CSS — the files themselves are
 * never modified, and the originals stay in the repo untouched.
 *
 *   node scripts/measure-trim.mjs   # public/media/** -> data/image-trim.json
 *
 * Output per image: [x, y, w, h] as fractions of the full image (0..1).
 * Images with no detectable padding are omitted, so a missing entry simply
 * means "use the whole file".
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from './image-size.mjs';

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const ROOT = 'public/media';
const OUT = 'data/image-trim.json';
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** A pixel counts as background only if it is near-white and near-neutral. */
const WHITE = 242;
/** Share of a row/column that must be background for it to be a margin. */
const ROW_RATIO = 0.985;
/** Ignore trims that barely change anything. */
const MIN_AREA_GAIN = 0.03;
/** Refuse to remove more than this much of either axis without saying so. */
const MAX_TRIM = 0.45;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    return e.isDirectory() ? walk(f) : EXTS.has(path.extname(e.name).toLowerCase()) ? [f] : [];
  });

function analyse(file) {
  const { width: fw, height: fh } = imageSize(file);
  // Work on a small copy; the margins are large, flat regions so precision
  // at full resolution buys nothing and costs a lot of time.
  const scale = Math.min(1, 260 / Math.max(fw, fh));
  const w = Math.max(8, Math.round(fw * scale));
  const h = Math.max(8, Math.round(fh * scale));

  const buf = execFileSync(
    FFMPEG,
    ['-v', 'error', '-i', file, '-vf', `scale=${w}:${h}`, '-frames:v', '1',
     '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    { maxBuffer: 1 << 26 },
  );

  const isBg = (x, y) => {
    const o = (y * w + x) * 3;
    const r = buf[o], g = buf[o + 1], b = buf[o + 2];
    return r > WHITE && g > WHITE && b > WHITE && Math.max(r, g, b) - Math.min(r, g, b) < 10;
  };
  const rowIsBg = (y) => {
    let n = 0;
    for (let x = 0; x < w; x++) if (isBg(x, y)) n++;
    return n / w >= ROW_RATIO;
  };
  const colIsBg = (x) => {
    let n = 0;
    for (let y = 0; y < h; y++) if (isBg(x, y)) n++;
    return n / h >= ROW_RATIO;
  };

  let top = 0, bottom = h - 1, left = 0, right = w - 1;
  while (top < bottom && rowIsBg(top)) top++;
  while (bottom > top && rowIsBg(bottom)) bottom--;
  while (left < right && colIsBg(left)) left++;
  while (right > left && colIsBg(right)) right--;

  // Bite one pixel further in on each side. Expanding outward instead leaves a
  // white hairline along the edge once the box is scaled back up to full
  // resolution, which is exactly the artefact this script exists to remove.
  // One pixel here is well under 0.5% of the image, so nothing is lost.
  if (right - left > 6) { left += 1; right -= 1; }
  if (bottom - top > 6) { top += 1; bottom -= 1; }

  const bw = right - left + 1, bh = bottom - top + 1;
  if (bw < 4 || bh < 4) return null;

  const box = { x: left / w, y: top / h, w: bw / w, h: bh / h };
  const gain = 1 - box.w * box.h;
  if (gain < MIN_AREA_GAIN) return null;               // nothing worth cropping
  const risky = box.w < 1 - MAX_TRIM || box.h < 1 - MAX_TRIM;
  return { box, gain, risky, full: [fw, fh] };
}

const files = walk(ROOT).sort();
const out = {};
const risky = [];
let trimmed = 0, untouched = 0, failed = 0;

for (const file of files) {
  const key = path.relative('public', file);
  try {
    const r = analyse(file);
    if (!r) { untouched++; continue; }
    out[key] = [+r.box.x.toFixed(4), +r.box.y.toFixed(4), +r.box.w.toFixed(4), +r.box.h.toFixed(4)];
    trimmed++;
    if (r.risky) risky.push(`${key} keeps only ${Math.round(r.box.w * 100)}%x${Math.round(r.box.h * 100)}%`);
  } catch (err) {
    failed++;
    console.error(`  ! ${key}: ${String(err.message).slice(0, 70)}`);
  }
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 0) + '\n');
console.log(`Trim boxes: ${trimmed} cropped, ${untouched} already full-bleed, ${failed} unreadable -> ${OUT}`);
if (risky.length) {
  console.log(`\n${risky.length} aggressive crop(s) — worth an eyeball:`);
  for (const r of risky.slice(0, 12)) console.log(`   ${r}`);
}
