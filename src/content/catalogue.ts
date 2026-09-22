import catalogue from '@data/catalogue.json';

/**
 * The catalogue records Safarkhan Art Gallery published for the two shows they
 * held, joined onto the plates this site serves.
 *
 * The artist's own site published every work uncaptioned, which is why almost
 * everything here is still a plate number. The gallery's exhibition pages are
 * the only place these titles, media and sizes exist. They are keyed to the
 * gallery's own photography, so `scripts/match-catalogue.mjs` establishes which
 * record is which plate by comparing the images; only unambiguous matches are
 * written into `data/catalogue.json`, and everything else keeps its plate
 * number rather than risk carrying the wrong name.
 *
 * Two shows are covered. The other six have no catalogue anywhere — Safarkhan's
 * site only goes back to 2023.
 */

export type CatalogueEntry = {
  /** Plate number within the exhibition, matching `Artwork.plate`. */
  plate: number;
  /** The gallery's own identifier for the record, kept so a claim is traceable. */
  source: string;
  title: string;
  /** The Wesal works are titled in Arabic; the Zat works in English. */
  titleLang: 'ar' | 'en';
  year: number | null;
  medium: string | null;
  /** As the gallery prints it — height before width. */
  dimensions: string | null;
  availability: string | null;
  /** Pixel distance to the matched plate, and how far clear of the runner-up. */
  confidence: { cost: number; margin: number };
};

const table = catalogue.exhibitions as unknown as Record<string, CatalogueEntry[]>;

const index = new Map<string, CatalogueEntry>();
for (const [slug, entries] of Object.entries(table)) {
  for (const entry of entries) index.set(`${slug}/${entry.plate}`, entry);
}

export const catalogueFor = (exhibitionSlug: string, plate: number) =>
  index.get(`${exhibitionSlug}/${plate}`) ?? null;

export const catalogueCount = index.size;

/** Which exhibitions have any catalogue at all, for the content-status note. */
export const catalogued = Object.entries(table).map(([slug, entries]) => ({
  slug,
  count: entries.length,
}));

export const catalogueSource = catalogue.source;
