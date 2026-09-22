import data from '@data/artist.json';
import { mediaUrl } from './site';

/**
 * Biography, read from the archive export.
 *
 * The career and exhibition-history strings are the artist's own words as they
 * appear on his site (one line was lightly edited for grammar during the
 * export — see `original_text_note`). Nothing is paraphrased or invented here.
 */

export type CvEntry = {
  year: number | string | null;
  title: string;
  venue?: string | null;
  city?: string | null;
  type?: string | null;
};

export const artist = {
  name: data.name,
  nameVariants: data.name_variants,
  roles: data.roles as string[],
  portrait: mediaUrl(data.portrait.local_path),
  education: data.education,
  career: data.career as string[],
  awards: data.awards,
  workshops: data.workshops,
  location: 'Cairo, Egypt',
  /** One line for the hero, built from his own listed roles. */
  tagline: (data.roles as string[]).join(' · '),
  editorialNote: data.original_text_note as string,
};

/** Full exhibition CV, oldest first, undated entries last. */
export const cv: CvEntry[] = [...(data.exhibition_history as CvEntry[])].sort((a, b) => {
  const key = (v: CvEntry['year']) =>
    v === null ? Number.POSITIVE_INFINITY : Number(String(v).slice(0, 4));
  return key(a.year) - key(b.year);
});

export const cvDated = cv.filter((e) => e.year !== null);
export const cvUndated = cv.filter((e) => e.year === null);
