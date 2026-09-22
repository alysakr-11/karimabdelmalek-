import dimensions from '@data/image-dimensions.json';
import trims from '@data/image-trim.json';
import focal from '@data/focal-points.json';

/**
 * Intrinsic size and content box for any media file in the export.
 *
 * `dimensions` is the file's true pixel size, measured from its header.
 * `trim` is the bounding box of the actual artwork inside that file, as
 * fractions of it — the source export letterboxes most paintings onto a white
 * canvas, and cropping to this box is what removes the white margins.
 *
 * Both are generated: `scripts/measure-media.mjs` and `scripts/measure-trim.mjs`.
 * The image files themselves are never modified; the crop happens in CSS.
 */
const sizeTable = dimensions as unknown as Record<string, [number, number]>;
const trimTable = trims as unknown as Record<string, [number, number, number, number]>;

export type Size = { width: number; height: number };
/** x, y, w, h — all fractions of the full image, 0..1. */
export type Trim = { x: number; y: number; w: number; h: number };

export const FULL_TRIM: Trim = { x: 0, y: 0, w: 1, h: 1 };

/** Where the subject sits in a picture, as fractions of the artwork: 0,0 is
 *  its top-left corner, 1,1 its bottom-right. */
export type Focus = { x: number; y: number };

const focusTable = focal.points as unknown as Record<string, [number, number]>;
const FULL = FULL_TRIM;

const key = (localPath: string) => localPath.replace(/^\/+/, '');

/** Falls back to a 4:5 portrait so a newly-added file cannot break layout. */
export function sizeOf(localPath: string): Size {
  const found = sizeTable[key(localPath)];
  return found ? { width: found[0], height: found[1] } : { width: 1000, height: 1250 };
}

/** The whole image when no padding was detected. */
export function trimOf(localPath: string): Trim {
  const t = trimTable[key(localPath)];
  return t ? { x: t[0], y: t[1], w: t[2], h: t[3] } : FULL;
}

/**
 * The size the artwork actually presents at once its padding is cropped away.
 * This is what layout must pack by — using the file's own ratio would reserve
 * boxes shaped like the white canvas rather than the painting.
 */
export function displaySizeOf(localPath: string): Size {
  const { width, height } = sizeOf(localPath);
  const t = trimOf(localPath);
  return { width: Math.round(width * t.w), height: Math.round(height * t.h) };
}

/**
 * The point a crop should keep in view, from data/focal-points.json. Null for
 * anything without an entry, which keeps the centre — right for almost every
 * picture, and wrong for a portrait whose face sits near the top.
 */
export function focusOf(localPath: string): Focus | null {
  const f = focusTable[key(localPath)];
  return f ? { x: f[0], y: f[1] } : null;
}

export const measuredCount = Object.keys(sizeTable).length;
export const trimmedCount = Object.keys(trimTable).length;
