import index from '@data/exhibitions.json';
import wsal from '@data/exhibitions/wsal-2025.json';
import zat from '@data/exhibitions/zat-2023.json';
import thirdEye from '@data/exhibitions/the-third-eye-2021.json';
import sakan from '@data/exhibitions/sakan-2019.json';
import horra from '@data/exhibitions/horra-2017.json';
import soul from '@data/exhibitions/soul-2016.json';
import caravan from '@data/exhibitions/caravan-arts.json';
import collection from '@data/exhibitions/collection.json';
import { displaySizeOf, trimOf, focusOf, type Focus, type Trim } from './media';
import { mediaUrl } from './site';
import { catalogueFor } from './catalogue';

/**
 * The eight galleries, in the export's order (newest first).
 *
 * IMPORTANT: the live site shows artwork with no captions at all — every
 * record's title, medium, dimensions and year are null in the export. Nothing
 * here invents them. A work is identified by its exhibition and its plate
 * number, which is the order it appears in on the artist's own site.
 *
 * The one exception is the gallery catalogue in `./catalogue` — real records
 * from Safarkhan for the two shows they held, matched to their plates by image
 * comparison. Those fields come from a published source, never from a guess,
 * and every other plate still shows as a plate.
 */

export type RawImage = {
  id: string;
  order: number;
  local_path: string;
  title: string | null;
  medium: string | null;
  dimensions: string | null;
  year: number | string | null;
};

export type Artwork = {
  /** Position in the gallery, 1-based — the artist's own ordering. */
  plate: number;
  /** URL segment within the exhibition. */
  slug: string;
  src: string;
  /** Size of the artwork once its white padding is cropped away — this is
   *  what layout packs by, not the file's own letterboxed shape. */
  width: number;
  height: number;
  /** Content box within the file, for the CSS crop. */
  trim: Trim;
  /** Where the subject sits, for crops into a frame of another shape. */
  focus: Focus | null;
  title: string | null;
  /** Script of the title, so it can be marked up and rendered correctly.
   *  Null when there is no title at all. */
  titleLang: 'ar' | 'en' | null;
  medium: string | null;
  /** As the gallery prints it — height before width. */
  dimensions: string | null;
  year: number | string | null;
  /** Whether the gallery listed the work as sold. Null when unknown. */
  availability: string | null;
  exhibitionSlug: string;
  exhibitionTitle: string;
  /** What the UI shows when there is no title — never a fabricated one. */
  label: string;
  alt: string;
};

export type Exhibition = {
  slug: string;
  title: string;
  year: number | null;
  type: string;
  venue: string | null;
  /** The show's own text, one string per paragraph. Empty when there is none,
   *  which is every show but Caravan. */
  description: string[];
  pageHeading: string | null;
  artworks: Artwork[];
  cover: Artwork;
  /** How many of the works carry a real title, from the gallery catalogue. */
  captioned: number;
};

type RawExhibition = {
  slug: string;
  title: string;
  year?: number | null;
  type?: string;
  venue?: string | null;
  /** The export stores this as a list of paragraphs — empty for seven of the
   *  eight shows. It was once typed as a string, which the cast below let
   *  through: an empty list is truthy, so the header rendered an empty box
   *  instead of its fallback, and the meta description came out blank. */
  description?: string[] | string | null;
  page_heading?: string | null;
  images: RawImage[];
};

/** Paragraphs, trimmed, blanks dropped — whatever shape the export used. */
function paragraphs(value: RawExhibition['description']): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((p) => p.trim()).filter(Boolean);
}

const FILES: RawExhibition[] = [
  wsal, zat, thirdEye, sakan, horra, soul, caravan, collection,
] as unknown as RawExhibition[];

function toArtwork(raw: RawImage, ex: RawExhibition): Artwork {
  const { width, height } = displaySizeOf(raw.local_path);
  const trim = trimOf(raw.local_path);
  const plateLabel = `${ex.title} · ${String(raw.order).padStart(2, '0')}`;

  // The export's own fields win where it has any; the gallery catalogue fills
  // the rest. In practice the export supplies none of these, so for the 31
  // matched works this is where every caption comes from.
  const cat = catalogueFor(ex.slug, raw.order);
  const title = raw.title ?? cat?.title ?? null;
  const titleLang = raw.title ? 'en' : (cat?.titleLang ?? null);

  return {
    plate: raw.order,
    slug: String(raw.order),
    src: mediaUrl(raw.local_path),
    width,
    height,
    trim,
    focus: focusOf(raw.local_path),
    title,
    titleLang,
    medium: raw.medium ?? cat?.medium ?? null,
    dimensions: raw.dimensions ?? cat?.dimensions ?? null,
    year: raw.year ?? cat?.year ?? null,
    availability: cat?.availability ?? null,
    exhibitionSlug: ex.slug,
    exhibitionTitle: ex.title,
    label: title ?? plateLabel,
    // Neither source carries a description, so alt text states what the image
    // is rather than describing a picture nobody has described.
    alt: title ? `${title} — ${ex.title}` : `Artwork ${raw.order} from ${ex.title}`,
  };
}

const order: string[] = index.exhibitions.map((e) => e.slug);

export const exhibitions: Exhibition[] = FILES.map((file) => {
  const artworks = [...file.images]
    .sort((a, b) => a.order - b.order)
    .map((raw) => toArtwork(raw, file));

  return {
    slug: file.slug,
    title: file.title,
    year: file.year ?? null,
    type: file.type ?? 'solo',
    venue: file.venue ?? null,
    description: paragraphs(file.description),
    pageHeading: file.page_heading ?? null,
    artworks,
    cover: artworks[0],
    captioned: artworks.filter((a) => a.title).length,
  };
}).sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

export const exhibitionBySlug = (slug: string) =>
  exhibitions.find((e) => e.slug === slug);

export const artworkAt = (slug: string, plate: string) =>
  exhibitionBySlug(slug)?.artworks.find((a) => a.slug === plate);

/** Every artwork across every gallery, for the home grid and the sitemap. */
export const allArtworks: Artwork[] = exhibitions.flatMap((e) => e.artworks);

export const totalArtworks = allArtworks.length;
