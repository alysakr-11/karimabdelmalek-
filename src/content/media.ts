import dimensions from '@data/image-dimensions.json';

/**
 * Intrinsic pixel size for any media file in the export.
 *
 * Measured from the file headers by `scripts/measure-media.mjs` — the gallery
 * packs its masonry from these ratios and reserves each box before the image
 * loads, so guessed values would make the grid jump as it fills.
 */
const table = dimensions as unknown as Record<string, [number, number]>;

export type Size = { width: number; height: number };

/** Falls back to a 4:5 portrait so a newly-added file cannot break layout. */
export function sizeOf(localPath: string): Size {
  const key = localPath.replace(/^\/+/, '');
  const found = table[key];
  return found ? { width: found[0], height: found[1] } : { width: 1000, height: 1250 };
}

export const isMeasured = (localPath: string) =>
  Object.hasOwn(table, localPath.replace(/^\/+/, ''));

export const measuredCount = Object.keys(table).length;
