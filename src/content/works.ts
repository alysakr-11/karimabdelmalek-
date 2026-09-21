import { collections } from './collections';

/**
 * ARTWORK MANIFEST
 * ----------------
 * This array is intentionally EMPTY.
 *
 * The artist's site could not be reached from this environment, so no artwork
 * files, titles, years, media or dimensions could be obtained. Rather than
 * invent any of those — or substitute stock imagery for a painter's actual
 * work — the gallery renders clearly-labelled reserved slots until real
 * entries are added here.
 *
 * To publish the real portfolio, see ARTWORK_ASSETS.md in the repository root.
 * Adding a single entry below switches every gallery surface over to real
 * content automatically; no component changes are needed.
 */

export type Work = {
  slug: string;
  /** The artwork's own title. Never a description invented on its behalf. */
  title: string;
  year?: string;
  /** e.g. "Mixed media on canvas". */
  medium?: string;
  /** e.g. "150 × 120 cm". */
  dimensions?: string;
  collection?: string;
  /** Path under /public, e.g. "/works/wesal-01.jpg". */
  image: string;
  /** Intrinsic pixel size — required so layout reserves the right box. */
  width: number;
  height: number;
  /**
   * Optional second image revealed on hover (a detail crop, or the work in
   * situ). Mirrors the reference site's card hover-swap.
   */
  hoverImage?: string;
  alt: string;
};

export const works: Work[] = [];

export const hasRealWorks = works.length > 0;

/**
 * Reserved slots used while `works` is empty. These are NOT artworks and are
 * never presented as such: each renders a neutral canvas-texture panel with an
 * explicit "image pending" caption. Their only job is to hold accurate layout
 * proportions so the gallery can be reviewed and signed off before the real
 * files arrive.
 *
 * Aspect ratios are ordinary stretcher sizes, varied so the masonry behaves
 * the way it will with real work.
 */
export type ReservedSlot = {
  id: string;
  collection: string;
  collectionTitle: string;
  year: string;
  ratio: number;
  seed: number;
};

const RATIOS = [0.78, 1, 0.72, 1.25, 0.8, 0.95, 0.7, 1.1, 0.85, 0.75, 1.33, 0.9];

export const reservedSlots: ReservedSlot[] = collections.flatMap((collection, ci) =>
  Array.from({ length: ci === 0 ? 5 : 4 }, (_, i) => {
    const n = ci * 4 + i;
    return {
      id: `${collection.slug}-${i + 1}`,
      collection: collection.slug,
      collectionTitle: collection.title,
      year: collection.year,
      ratio: RATIOS[n % RATIOS.length],
      seed: n * 37 + 11,
    };
  }),
);
