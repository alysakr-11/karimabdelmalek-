import { SOURCES } from './artist';

/**
 * Solo exhibitions, used as the portfolio's collection taxonomy.
 * Every entry is sourced. No exhibition is listed that could not be verified,
 * and no descriptive copy is attributed to the artist that he did not write.
 */
export type Collection = {
  slug: string;
  title: string;
  /** Latin transliteration as published, kept verbatim. */
  year: string;
  venue: string;
  /** Only present where a specific run was published. */
  dates?: string;
  source: string;
};

export const collections: Collection[] = [
  {
    slug: 'wesal',
    title: 'Wesāl',
    year: '2025',
    venue: 'Safarkhan Art Gallery, Cairo',
    dates: '4 — 28 January 2025',
    source: SOURCES.safarkhanExhibitions,
  },
  {
    slug: 'zat',
    title: 'Zāt',
    year: '2023',
    venue: 'Safarkhan Art Gallery, Cairo',
    source: SOURCES.safarkhanExhibitions,
  },
  {
    slug: 'the-third-eye',
    title: 'The Third Eye',
    year: '2021',
    venue: 'Safarkhan Art Gallery, Cairo',
    source: SOURCES.ownSite,
  },
  {
    slug: 'sakan',
    title: 'Sakan',
    year: '2019',
    venue: 'Safarkhan Art Gallery, Cairo',
    source: SOURCES.ownSite,
  },
  {
    slug: 'horra',
    title: 'Horra',
    year: '2017',
    venue: 'Safarkhan Art Gallery, Cairo',
    source: SOURCES.ownSite,
  },
];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);
