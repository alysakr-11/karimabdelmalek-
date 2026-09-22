#!/usr/bin/env node
/**
 * Records the true pixel dimensions of every media file.
 *
 * The content export has no image dimensions, but the gallery packs its
 * masonry from aspect ratios and reserves each box before the image loads.
 * Without real numbers the grid jumps as it fills in.
 *
 *   node scripts/measure-media.mjs   # public/media/** -> data/image-dimensions.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from './image-size.mjs';

const ROOT = 'public/media';
const OUT = 'data/image-dimensions.json';
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return EXTS.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

const files = walk(ROOT).sort();
const out = {};
const failed = [];

for (const file of files) {
  // Key by the path the JSON export uses, so lookups need no translation.
  const key = path.relative('public', file);
  try {
    const { width, height } = imageSize(file);
    if (!width || !height) throw new Error('zero dimension');
    out[key] = [width, height];
  } catch (err) {
    failed.push(`${key}: ${err.message}`);
  }
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 0) + '\n');
console.log(`Measured ${Object.keys(out).length}/${files.length} files -> ${OUT}`);
if (failed.length) {
  console.error(`\n${failed.length} could not be read:`);
  for (const f of failed) console.error(`  - ${f}`);
  process.exit(1);
}
