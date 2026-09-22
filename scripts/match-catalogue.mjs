#!/usr/bin/env node
/**
 * Joins Safarkhan's catalogue records to the plates this site actually serves.
 *
 * The gallery's records (karim-media/data/works.json) carry the titles, media
 * and sizes the artist's own site never published — but they are keyed to the
 * gallery's own photography, not to the files in public/media. Nothing in
 * either source states which gallery record is which plate, so the join has to
 * be established from the pictures themselves.
 *
 *   node scripts/match-catalogue.mjs           # -> data/catalogue.json
 *   node scripts/match-catalogue.mjs --report  # print the full cost table
 *
 * Method: crop each plate to its measured trim box, resize both images to a
 * fixed grid, normalise each channel to zero mean and unit variance — the two
 * photographers lit and white-balanced differently, and without this the
 * exposure gap swamps the content — then score every pairing by pixel distance
 * plus a penalty for disagreeing aspect ratios. Hungarian assignment picks the
 * globally cheapest one-to-one mapping rather than letting a greedy pass strand
 * the last few works on whatever is left.
 *
 * A pairing is only written out if it is the cheapest for its record AND clears
 * both thresholds. Everything else is dropped: the site keeps showing a plate
 * number, which is honest, where a wrong title would not be.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = 'data/catalogue.json';

/** Feature grid per side. 28 is enough to separate these works and small
 *  enough that framing and crop differences do not dominate. */
const GRID = 28;
/** Weight on aspect disagreement, in log space. Tuned so a clear ratio
 *  mismatch can veto an otherwise mediocre pixel match. */
const RATIO_WEIGHT = 6;
/** Above this pixel distance the pair is not the same painting. */
const MAX_COST = 1.0;
/** The runner-up must be at least this much worse, or the match is a guess.
 *  This is what rejects the two Zat highchairs: near-identical sculptures
 *  photographed alike, where the evidence cannot say which is I and which II. */
const MIN_MARGIN = 0.4;

/** Which gallery folder holds which catalogue series. */
const PAIRS = [
  ['wsal-2025', 'wesal-2025'],
  ['zat-2023', 'zat-2023'],
  ['the-third-eye-2021', 'the-third-eye-2021'],
];

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const dimensions = read('data/image-dimensions.json');
const trims = read('data/image-trim.json');
const works = read('karim-media/data/works.json');

/** Zero-mean, unit-variance per channel. */
function normalise(buf) {
  const out = new Float32Array(buf.length);
  for (let ch = 0; ch < 3; ch++) {
    let sum = 0;
    let n = 0;
    for (let i = ch; i < buf.length; i += 3) {
      sum += buf[i];
      n++;
    }
    const mean = sum / n;
    let ss = 0;
    for (let i = ch; i < buf.length; i += 3) ss += (buf[i] - mean) ** 2;
    const sd = Math.sqrt(ss / n) || 1;
    for (let i = ch; i < buf.length; i += 3) out[i] = (buf[i] - mean) / sd;
  }
  return out;
}

/** The plate as the site shows it: cropped to the artwork, white canvas gone. */
async function plateFeature(localPath) {
  const [W, H] = dimensions[localPath];
  // A missing trim entry means no padding was detected — the file is its own box.
  const [x, y, w, h] = trims[localPath] ?? [0, 0, 1, 1];
  const buf = await sharp(path.join(ROOT, 'public', localPath))
    .extract({
      left: Math.round(x * W),
      top: Math.round(y * H),
      width: Math.max(1, Math.round(w * W)),
      height: Math.max(1, Math.round(h * H)),
    })
    .resize(GRID, GRID, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();
  return { feature: normalise(buf), ratio: (w * W) / (h * H) };
}

async function workFeature(work) {
  const buf = await sharp(path.join(ROOT, 'karim-media', work.image))
    .resize(GRID, GRID, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();
  return { feature: normalise(buf), ratio: work.aspectRatio };
}

const distance = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return s / a.length;
};

/** Hungarian assignment on a rectangular cost matrix, rows <= columns. */
function assign(cost) {
  const n = cost.length;
  const m = cost[0].length;
  const INF = Infinity;
  const u = new Float64Array(n + 1);
  const v = new Float64Array(m + 1);
  const p = new Int32Array(m + 1).fill(-1);
  const way = new Int32Array(m + 1);

  for (let i = 0; i < n; i++) {
    p[m] = i;
    let j0 = m;
    const minv = new Float64Array(m + 1).fill(INF);
    const used = new Uint8Array(m + 1);
    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = INF;
      let j1 = -1;
      for (let j = 0; j < m; j++) {
        if (used[j]) continue;
        const cur = cost[i0][j] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== -1);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== m);
  }

  const result = new Int32Array(n).fill(-1);
  for (let j = 0; j < m; j++) if (p[j] >= 0 && p[j] < n) result[p[j]] = j;
  return result;
}

async function matchOne(exhibitionSlug, series, report) {
  const exhibition = read(`data/exhibitions/${exhibitionSlug}.json`);
  const plates = [...exhibition.images].sort((a, b) => a.order - b.order);
  const records = works.filter((w) => w.series === series);
  if (!records.length) return [];

  const P = await Promise.all(plates.map((p) => plateFeature(p.local_path)));
  const C = await Promise.all(records.map(workFeature));

  const cost = records.map((_, ci) =>
    plates.map(
      (__, pi) =>
        distance(C[ci].feature, P[pi].feature) +
        RATIO_WEIGHT * Math.abs(Math.log(C[ci].ratio / P[pi].ratio)),
    ),
  );

  // Hungarian needs rows <= columns; transpose when there are more records
  // than plates and read the mapping back the other way.
  const wide = records.length <= plates.length;
  const solved = wide
    ? assign(cost)
    : assign(cost[0].map((_, j) => cost.map((row) => row[j])));

  const accepted = [];
  records.forEach((work, ci) => {
    const pi = wide ? solved[ci] : [...solved].indexOf(ci);
    if (pi < 0) {
      if (report) console.log(`  ${work.slug.padEnd(20)} unassigned`);
      return;
    }
    const row = cost[ci];
    const ranked = [...row.keys()].sort((a, b) => row[a] - row[b]);
    const isBest = ranked[0] === pi;
    const margin = row[ranked[1]] - row[ranked[0]];
    const ok = isBest && row[pi] < MAX_COST && margin > MIN_MARGIN;

    if (report) {
      console.log(
        `  ${work.slug.padEnd(20)} -> plate ${String(plates[pi].order).padStart(2)}  ` +
          `cost ${row[pi].toFixed(3).padStart(6)}  margin ${margin.toFixed(3).padStart(6)}  ` +
          `${ok ? 'accept' : 'REJECT'}  ${work.title ?? ''}`,
      );
    }
    if (!ok) return;

    accepted.push({
      plate: plates[pi].order,
      source: work.slug,
      title: work.title,
      // Latin titles come through as-is; the Wesal works are titled in Arabic,
      // which the UI has to mark up as such to render and read correctly.
      titleLang: /[؀-ۿ]/.test(work.title ?? '') ? 'ar' : 'en',
      year: work.year ?? null,
      medium: work.medium ?? null,
      // Gallery convention, carried over verbatim: height before width.
      dimensions: work.dimensions ?? null,
      availability: work.availability ?? null,
      confidence: { cost: +row[pi].toFixed(4), margin: +margin.toFixed(4) },
    });
  });

  accepted.sort((a, b) => a.plate - b.plate);
  return accepted;
}

const report = process.argv.includes('--report');
const exhibitions = {};
let total = 0;

for (const [exhibitionSlug, series] of PAIRS) {
  if (report) console.log(`\n${exhibitionSlug} <- ${series}`);
  const accepted = await matchOne(exhibitionSlug, series, report);
  if (accepted.length) exhibitions[exhibitionSlug] = accepted;
  total += accepted.length;
  console.log(`${exhibitionSlug.padEnd(20)} ${String(accepted.length).padStart(2)} works matched`);
}

const output = {
  source: 'Safarkhan Art Gallery exhibition pages, via karim-media/data/works.json',
  note:
    'Generated by scripts/match-catalogue.mjs. Every entry was matched to its ' +
    'plate by image comparison, not by any identifier the sources share. ' +
    'Dimensions read height before width, as the gallery prints them.',
  thresholds: { grid: GRID, ratioWeight: RATIO_WEIGHT, maxCost: MAX_COST, minMargin: MIN_MARGIN },
  exhibitions,
};

fs.writeFileSync(path.join(ROOT, OUT), `${JSON.stringify(output, null, 2)}\n`);
console.log(`\n${total} works written to ${OUT}`);
