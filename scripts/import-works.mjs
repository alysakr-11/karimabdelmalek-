#!/usr/bin/env node
/**
 * Turns a folder of artwork files into the site's artwork manifest.
 *
 *   node scripts/import-works.mjs scan    # files  -> content/works.csv
 *   node scripts/import-works.mjs build   # csv    -> src/content/works.ts
 *
 * Two steps on purpose. `scan` fills in only what a file can actually tell us
 * — its path and its true pixel dimensions — and leaves the rest blank for a
 * human. `build` refuses to run while a title or alt text is missing, so the
 * manifest can never be completed by guesswork.
 *
 * Naming: a file whose name ends `-detail` or `-hover` is attached to the work
 * of the same base name as its hover image rather than becoming a work itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from './image-size.mjs';

const WORKS_DIR = 'public/works';
const CSV_PATH = 'content/works.csv';
const OUT_PATH = 'src/content/works.ts';
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const COLUMNS = ['file', 'title', 'year', 'medium', 'dimensions', 'collection', 'alt', 'width', 'height'];

// --- tiny CSV that survives commas and quotes in titles ---------------------
const esc = (v) => (/[",\n]/.test(v ?? '') ? `"${String(v).replace(/"/g, '""')}"` : (v ?? ''));

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function collectionSlugs() {
  const src = fs.readFileSync('src/content/collections.ts', 'utf8');
  return [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
}

function listImages() {
  if (!fs.existsSync(WORKS_DIR)) return [];
  return fs.readdirSync(WORKS_DIR)
    .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
    .sort();
}

// --- scan -------------------------------------------------------------------
function scan() {
  const files = listImages();
  if (files.length === 0) {
    console.error(`No images in ${WORKS_DIR}/. Put the artwork files there first.`);
    process.exit(1);
  }

  const slugs = collectionSlugs();
  const existing = fs.existsSync(CSV_PATH)
    ? new Map(parseCsv(fs.readFileSync(CSV_PATH, 'utf8')).slice(1).map((r) => [r[0], r]))
    : new Map();

  const rows = [];
  let hovers = 0;
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    if (/-(detail|hover)$/.test(base)) { hovers++; continue; }

    let size;
    try { size = imageSize(path.join(WORKS_DIR, file)); }
    catch (err) { console.error(`  ! ${file}: ${err.message}`); continue; }

    // Keep anything already typed in; only refresh what the file itself knows.
    const prev = existing.get(file) ?? [];
    const guessed = slugs.find((s) => base.toLowerCase().startsWith(s)) ?? '';
    rows.push([
      file,
      prev[1] ?? '',
      prev[2] ?? '',
      prev[3] ?? '',
      prev[4] ?? '',
      prev[5] || guessed,
      prev[6] ?? '',
      String(size.width),
      String(size.height),
    ]);
  }

  fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
  fs.writeFileSync(CSV_PATH, [COLUMNS, ...rows].map((r) => r.map(esc).join(',')).join('\n') + '\n');

  console.log(`Scanned ${rows.length} work(s)${hovers ? `, ${hovers} hover image(s)` : ''}.`);
  console.log(`Wrote ${CSV_PATH} — fill in title and alt (year, medium, dimensions, collection optional),`);
  console.log(`then run:  node scripts/import-works.mjs build`);
}

// --- build ------------------------------------------------------------------
function build() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`${CSV_PATH} not found. Run the scan step first.`);
    process.exit(1);
  }

  const [header, ...rows] = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  for (const required of ['file', 'title', 'alt', 'width', 'height']) {
    if (col[required] === undefined) {
      console.error(`${CSV_PATH} is missing the "${required}" column.`);
      process.exit(1);
    }
  }

  const slugs = collectionSlugs();
  const files = new Set(listImages());
  const problems = [];
  const seen = new Set();
  const works = [];

  for (const [n, row] of rows.entries()) {
    const at = `row ${n + 2}`;
    const get = (k) => (row[col[k]] ?? '').trim();
    const file = get('file');
    const title = get('title');
    const alt = get('alt');

    if (!file) { problems.push(`${at}: no file`); continue; }
    if (!files.has(file)) problems.push(`${at}: ${file} is not in ${WORKS_DIR}/`);
    // These two are the ones that must come from a person, never from a guess.
    if (!title) problems.push(`${at}: ${file} has no title`);
    if (!alt) problems.push(`${at}: ${file} has no alt text`);

    const collection = get('collection');
    if (collection && !slugs.includes(collection)) {
      problems.push(`${at}: collection "${collection}" is not one of: ${slugs.join(', ')}`);
    }

    const width = Number(get('width')), height = Number(get('height'));
    if (!width || !height) problems.push(`${at}: ${file} has no usable dimensions — re-run scan`);

    let slug = slugify(title || path.basename(file, path.extname(file)));
    while (seen.has(slug)) slug = `${slug}-2`;
    seen.add(slug);

    const ext = path.extname(file);
    const stem = path.basename(file, ext);
    const hover = [`${stem}-detail${ext}`, `${stem}-hover${ext}`].find((f) => files.has(f));

    works.push({
      slug, title, year: get('year'), medium: get('medium'),
      dimensions: get('dimensions'), collection,
      image: `/works/${file}`,
      hoverImage: hover ? `/works/${hover}` : '',
      width, height, alt,
    });
  }

  if (problems.length) {
    console.error(`Not writing the manifest — ${problems.length} thing(s) need a human:\n`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error(`\nFill them in in ${CSV_PATH} and run build again.`);
    process.exit(1);
  }

  const entry = (w) => {
    const lines = [`    slug: '${w.slug}',`, `    title: ${JSON.stringify(w.title)},`];
    for (const k of ['year', 'medium', 'dimensions', 'collection']) {
      if (w[k]) lines.push(`    ${k}: ${JSON.stringify(w[k])},`);
    }
    lines.push(`    image: '${w.image}',`);
    if (w.hoverImage) lines.push(`    hoverImage: '${w.hoverImage}',`);
    lines.push(`    width: ${w.width},`, `    height: ${w.height},`, `    alt: ${JSON.stringify(w.alt)},`);
    return `  {\n${lines.join('\n')}\n  },`;
  };

  const src = fs.readFileSync(OUT_PATH, 'utf8');
  const next = src.replace(
    /export const works: Work\[\] = \[[\s\S]*?\n\];|export const works: Work\[\] = \[\];/,
    `export const works: Work[] = [\n${works.map(entry).join('\n')}\n];`,
  );
  if (next === src) {
    console.error(`Could not find the works array in ${OUT_PATH}.`);
    process.exit(1);
  }

  fs.writeFileSync(OUT_PATH, next);
  console.log(`Wrote ${works.length} work(s) to ${OUT_PATH}.`);
  console.log(`${works.filter((w) => w.hoverImage).length} have a hover image.`);
  console.log(`\nNext:  npm run build`);
}

const mode = process.argv[2];
if (mode === 'scan') scan();
else if (mode === 'build') build();
else {
  console.error('Usage: node scripts/import-works.mjs <scan|build>');
  process.exit(1);
}
