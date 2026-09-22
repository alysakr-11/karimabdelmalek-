import index from '@data/exhibitions.json';
import wsal from '@data/exhibitions/wsal-2025.json';
import zat from '@data/exhibitions/zat-2023.json';
import thirdEye from '@data/exhibitions/the-third-eye-2021.json';
import sakan from '@data/exhibitions/sakan-2019.json';
import horra from '@data/exhibitions/horra-2017.json';
import soul from '@data/exhibitions/soul-2016.json';
import caravan from '@data/exhibitions/caravan-arts.json';
import collection from '@data/exhibitions/collection.json';
import { sizeOf } from './media';
import { mediaUrl } from './site';

/**
 * The eight galleries, in the export's order (newest first).
 *
 * IMPORTANT: the live site shows artwork with no captions at all — every
 * record's title, medium, dimensions and year are null in the export. Nothing
 * here invents them. A work is identified by its exhibition and its plate
 * number, which is the order it appears in on the artist's own site.
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
  width: number;
  height: number;
  title: string | null;
  medium: string | null;
  dimensions: string | null;
  year: number | string | null;
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
  description: string | null;
  pageHeading: string | null;
  artworks: Artwork[];
  cover: Artwork;
};

type RawExhibition = {
  slug: string;
  title: string;
  year?: number | null;
  type?: string;
  venue?: string | null;
  description?: string | null;
  page_heading?: string | null;
  images: RawImage[];
};

const FILES: RawExhibition[] = [
  wsal, zat, thirdEye, sakan, horra, soul, caravan, collection,
] as unknown as RawExhibition[];

function toArtwork(raw: RawImage, ex: RawExhibition): Artwork {
  const { width, height } = sizeOf(raw.local_path);
  const label = `${ex.title} · ${String(raw.order).padStart(2, '0')}`;
  return {
    plate: raw.order,
    slug: String(raw.order),
    src: mediaUrl(raw.local_path),
    width,
    height,
    title: raw.title,
    medium: raw.medium,
    dimensions: raw.dimensions,
    year: raw.year,
    exhibitionSlug: ex.slug,
    exhibitionTitle: ex.title,
    label: raw.title ?? label,
    // The export carries no descriptions, so alt text states what the image
    // is rather than describing a picture nobody has captioned.
    alt: raw.title
      ? `${raw.title} — ${ex.title}`
      : `Artwork ${raw.order} from ${ex.title}`,
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
    description: file.description ?? null,
    pageHeading: file.page_heading ?? null,
    artworks,
    cover: artworks[0],
  };
}).sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

export const exhibitionBySlug = (slug: string) =>
  exhibitions.find((e) => e.slug === slug);

export const artworkAt = (slug: string, plate: string) =>
  exhibitionBySlug(slug)?.artworks.find((a) => a.slug === plate);

/** Every artwork across every gallery, for the home grid and the sitemap. */
export const allArtworks: Artwork[] = exhibitions.flatMap((e) => e.artworks);

export const totalArtworks = allArtworks.length;
