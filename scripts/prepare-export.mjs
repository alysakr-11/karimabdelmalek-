#!/usr/bin/env node
/**
 * Makes a static export fit to publish, in place.
 *
 *   node scripts/prepare-export.mjs out [basePath]
 *
 * Two jobs, both of which the export gets wrong on its own:
 *
 * 1. **Downscale the images.** A static host has no image optimiser, so
 *    `next build` with `output: export` copies `public/media` through
 *    untouched — 132MB of originals, some 9MB apiece and 8000px wide. A
 *    gallery page would pull tens of megabytes to show pictures a few hundred
 *    pixels across. The originals are never modified: they are the archive,
 *    and the server build still optimises from them on demand.
 *
 * 2. **Prefix the font URLs.** `fonts.css` asks for `/fonts/...` from the
 *    domain root. Next rewrites its own asset URLs for a basePath but not a
 *    `url()` inside a stylesheet, so under a sub-path every face 404s and the
 *    site falls back to system fonts — Arabic included, which is the one that
 *    has no system fallback worth having. This rewrite is asserted: matching
 *    nothing fails the build rather than shipping a site with no typography.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.argv[2] ?? 'out';
const basePath = process.argv[3] ?? '';

/** Wide enough for a full-bleed artwork on a 2x display, small enough to send. */
const MAX_EDGE = 2000;
const QUALITY = 78;
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function filesUnder(dir, match) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, match));
    else if (match(entry.name)) out.push(full);
  }
  return out;
}

// ---- images ---------------------------------------------------------------

const mediaDir = path.join(root, 'media');
if (!fs.existsSync(mediaDir)) {
  console.error(`no ${mediaDir} — run the export first`);
  process.exit(1);
}

const images = filesUnder(mediaDir, (n) => IMAGE_EXTS.has(path.extname(n).toLowerCase()));
let before = 0;
let after = 0;
let rewrittenImages = 0;

for (const file of images) {
  const originalSize = fs.statSync(file).size;
  before += originalSize;

  const ext = path.extname(file).toLowerCase();
  const image = sharp(file, { failOn: 'none' });
  const meta = await image.metadata();

  let pipeline = image;
  if (Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE) {
    pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true });
  }
  if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
  else if (ext === '.webp') pipeline = pipeline.webp({ quality: QUALITY });
  else pipeline = pipeline.jpeg({ quality: QUALITY, progressive: true, mozjpeg: true });

  // sharp cannot read and write the same path in one pass.
  const buffer = await pipeline.toBuffer();
  if (buffer.length < originalSize) {
    fs.writeFileSync(file, buffer);
    rewrittenImages++;
    after += buffer.length;
  } else {
    // Already smaller than anything we would produce; leave it alone.
    after += originalSize;
  }
}

const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `images: ${images.length} found, ${rewrittenImages} rewritten, ${mb(before)} MB -> ${mb(after)} MB`,
);

// ---- font URLs ------------------------------------------------------------

if (basePath) {
  const sheets = filesUnder(root, (n) => n.endsWith('.css'));
  const NEEDLE = 'url(/fonts/';
  let prefixed = 0;

  for (const sheet of sheets) {
    const css = fs.readFileSync(sheet, 'utf8');
    if (!css.includes(NEEDLE)) continue;
    prefixed += css.split(NEEDLE).length - 1;
    fs.writeFileSync(sheet, css.replaceAll(NEEDLE, `url(${basePath}/fonts/`));
  }

  if (prefixed === 0) {
    console.error(
      `no font URLs rewritten across ${sheets.length} stylesheet(s) in ${root}.\n` +
        `Nothing asked for "${NEEDLE}" — either the fonts moved or Next started ` +
        'rewriting them itself. Check before shipping: the export would otherwise ' +
        'go out with no typefaces at all.',
    );
    process.exit(1);
  }
  console.log(`fonts: ${prefixed} URLs prefixed with ${basePath}`);
}
