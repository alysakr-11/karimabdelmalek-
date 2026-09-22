#!/usr/bin/env node
/**
 * Re-encodes served media down to what the site can actually deliver.
 *
 * The export committed the stored originals straight from the old site's CDN,
 * which was right for an archive but wrong for `public/`: they had never been
 * through an encoder, and two of them were 9 MB each.
 *
 *   node scripts/optimise-media.mjs public/media/site            # do it
 *   node scripts/optimise-media.mjs public/media/site --dry-run  # just report
 *
 * Two rules, both chosen so nothing visible is lost:
 *
 * 1. Cap the width at 2560. `deviceSizes` in next.config.mjs stops at 2560, so
 *    next/image never requests a larger rendition — pixels beyond that can not
 *    reach a visitor under any viewport or DPR. Removing them is free.
 * 2. Re-encode JPEG at quality 82 with mozjpeg, and keep the result only if it
 *    is actually smaller.
 *
 * A file is only rewritten when doing so saves a real amount (MIN_SAVING), so
 * running this twice is a no-op rather than a second round of lossy encoding.
 * That matters: JPEG is generational, and an accidental double run would
 * quietly degrade every file it touched.
 *
 * ORIGINALS: not copied anywhere. They are blobs in git history — home-hero.jpg
 * at 8,945,087 bytes is reachable from the commit that added the archive — so a
 * second copy in the working tree would cost ~30 MB and buy nothing. `git show
 * <commit>:public/media/<path> > file.jpg` brings one back. The gallery's own
 * higher-resolution photography is separately in karim-media/.
 *
 * After running this, regenerate the measurements the masonry packs from:
 *   node scripts/measure-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 2560;
const QUALITY = 82;
/** Below this, re-encoding is not worth the churn in the diff. */
const MIN_BYTES = 400_000;
/**
 * Rewrite only when at least this much is saved.
 *
 * This is what makes the script idempotent. Re-encoding an already-encoded
 * JPEG shaves a few percent every time while losing a little more each round,
 * so "smaller at all" is not a safe condition to write on — "meaningfully
 * smaller" is, and it converges after one pass.
 */
const MIN_SAVING = 0.15;
const EXTS = new Set(['.jpg', '.jpeg']);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const roots = args.filter((a) => !a.startsWith('--'));

if (roots.length === 0) {
  console.error('usage: node scripts/optimise-media.mjs <dir|file> [...] [--dry-run]');
  process.exit(1);
}

function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .flatMap((entry) => walk(path.join(target, entry.name)));
}

/**
 * Mean absolute per-channel difference between two images, 0-255.
 *
 * Re-encoding should be invisible, not merely smaller, so each file reports
 * how far it actually moved rather than asking anyone to take it on trust.
 */
async function meanDifference(beforeBuf, afterBuf) {
  const size = 256;
  const toRaw = (buf) =>
    sharp(buf).resize(size, size, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const [a, b] = await Promise.all([toRaw(beforeBuf), toRaw(afterBuf)]);
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

const files = roots
  .flatMap(walk)
  .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
  .sort();

let before = 0;
let after = 0;
let changed = 0;
let worstDiff = 0;

for (const file of files) {
  const original = fs.readFileSync(file);
  const meta = await sharp(original).metadata();
  before += original.length;

  const needsResize = (meta.width ?? 0) > MAX_WIDTH;
  if (!needsResize && original.length < MIN_BYTES) {
    after += original.length;
    console.log(`  skip  ${file}  (${(original.length / 1e6).toFixed(2)}MB, ${meta.width}px)`);
    continue;
  }

  let pipeline = sharp(original).rotate();
  if (needsResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const output = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();

  const saving = 1 - output.length / original.length;
  if (saving < MIN_SAVING) {
    after += original.length;
    console.log(
      `  keep  ${file}  (only ${Math.round(saving * 100)}% smaller — already optimised)`,
    );
    continue;
  }

  const diff = await meanDifference(original, output);
  worstDiff = Math.max(worstDiff, diff);
  after += output.length;
  changed += 1;

  const outMeta = await sharp(output).metadata();
  console.log(
    `  ${dryRun ? 'would' : 'write'} ${file}\n` +
      `        ${meta.width}x${meta.height} ${(original.length / 1e6).toFixed(2)}MB` +
      ` -> ${outMeta.width}x${outMeta.height} ${(output.length / 1e6).toFixed(2)}MB` +
      `  (-${Math.round((1 - output.length / original.length) * 100)}%, mean diff ${diff.toFixed(2)}/255)`,
  );

  if (!dryRun) fs.writeFileSync(file, output);
}

console.log(
  `\n${dryRun ? 'Would rewrite' : 'Rewrote'} ${changed} of ${files.length} files: ` +
    `${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB ` +
    `(-${Math.round((1 - after / before) * 100)}%). Largest mean difference ${worstDiff.toFixed(2)}/255.`,
);
if (!dryRun && changed > 0) {
  console.log('Now run: node scripts/measure-media.mjs');
}
