import { exhibitionBySlug, type Artwork } from './exhibitions';
import { FULL_TRIM, type Focus, type Trim } from './media';
import { mediaUrl } from './site';
import { SITE_NAME } from './site';

/**
 * The works the home page's hero cycles through.
 *
 * Chosen by eye from a contact sheet of every candidate cropped to the hero's
 * 4:5 frame, for three things: the face sits well inside that frame, the
 * sequence alternates warm and cool so each change reads, and the source is
 * sharp enough for the frame. That last rule limits this to Wesāl and Zāt,
 * whose files are 1326 px tall after trimming; the earlier shows' are about
 * 650 px, which goes soft in a frame this size on a phone or a retina screen.
 *
 * The first slide is the painting the hero has always opened on, so the page
 * paints exactly as it did before the showcase existed.
 */
const PICKS: Array<[slug: string, plate: number]> = [
  ['wsal-2025', 1],
  ['zat-2023', 5],
  ['wsal-2025', 3],
  ['zat-2023', 7],
  ['zat-2023', 15],
  ['wsal-2025', 8],
  ['zat-2023', 10],
];

export type ShowcaseSlide = {
  key: string;
  src: string;
  alt: string;
  trim: Trim;
  focus: Focus | null;
  /** Width over height of the picture after trimming. */
  ratio?: number;
  /** The work's own page, where the caption and the picture both lead. */
  href: string | null;
  /** The work's title; null when it has none. */
  label: string | null;
  labelLang: 'ar' | 'en' | null;
  /** Exhibition and year, e.g. "Zat · 2023". */
  meta: string | null;
};

function fromArtwork(a: Artwork, year: number | string | null): ShowcaseSlide {
  return {
    key: `${a.exhibitionSlug}-${a.plate}`,
    src: a.src,
    alt: a.alt,
    trim: a.trim,
    focus: a.focus,
    ratio: a.width / a.height,
    href: `/exhibitions/${a.exhibitionSlug}/${a.slug}`,
    // Untitled works fall back to their plate label ("Zat · 05") elsewhere;
    // here the show and year underneath already say it, without a number.
    label: a.title ?? null,
    labelLang: a.titleLang,
    meta: [a.exhibitionTitle, year].filter(Boolean).join(' · ') || null,
  };
}

/**
 * The opening painting is plate 1 of The Third Eye (2021), matched by eye and
 * by a pixel comparison against every exhibition image. It keeps its own
 * larger file, which the page has always opened on, but links to its page and
 * carries its caption like every other work.
 */
const opening = exhibitionBySlug('the-third-eye-2021');
const openingArt = opening?.artworks.find((a) => a.plate === 1);

export const showcase: ShowcaseSlide[] = [
  openingArt
    ? {
        ...fromArtwork(openingArt, opening?.year ?? null),
        key: 'hero',
        src: mediaUrl('media/site/home-hero.jpg'),
        trim: FULL_TRIM,
        // Framing as before: the plate's focus and ratio describe a different
        // file (the exhibition scan, with its white margin).
        focus: null,
        ratio: undefined,
      }
    : {
        key: 'hero',
        src: mediaUrl('media/site/home-hero.jpg'),
        alt: `Artwork by ${SITE_NAME}`,
        trim: FULL_TRIM,
        focus: null,
        href: null,
        label: null,
        labelLang: null,
        meta: null,
      },
  ...PICKS.flatMap(([slug, plate]) => {
    const ex = exhibitionBySlug(slug);
    const art = ex?.artworks.find((a) => a.plate === plate);
    return art ? [fromArtwork(art, ex?.year ?? null)] : [];
  }),
];
