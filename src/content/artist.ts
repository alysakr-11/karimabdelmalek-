/**
 * VERIFIED CONTENT ONLY.
 *
 * karimabdelmalak.com could not be reached from the build environment (the
 * network egress policy returns 403 for that host), so every fact below was
 * gathered from published secondary sources and carries a `source` field.
 *
 * Rules for editing this file:
 *   1. Do not add a biographical claim without a `source`.
 *   2. When the artist's own site becomes reachable, reconcile these entries
 *      against it — his own wording takes precedence over gallery copy.
 *   3. Anything still unknown belongs in `MISSING_CONTENT`, not in prose.
 */

export type Sourced<T> = { value: T; source: string };

export const SOURCES = {
  safarkhanBio:
    'Safarkhan Art Gallery — artist biography (safarkhan.com/artists/127-karim-abd-elmalak)',
  safarkhanExhibitions: 'Safarkhan Art Gallery — exhibitions index (safarkhan.com/exhibitions)',
  welum: 'Welum — "Egyptian Artist Karim Abd Elmalak"',
  ownSite: 'karimabdelmalak.com (about page, via search index summary — not directly retrievable)',
  instagram: 'Instagram — @karimabdelmalak',
} as const;

export const artist = {
  /** He is indexed under both spellings; the domain uses the first. */
  name: 'Karim Abdel Malak',
  nameAlt: 'Karim Abd Elmalak',
  /** Rendered as a stacked two-line logotype in the header. */
  logotype: ['KARIM', 'ABDEL MALAK'] as const,
  role: 'Contemporary artist',
  location: 'Cairo, Egypt',

  /** One-line positioning used in the hero and in page metadata. */
  tagline: 'Mixed media, earth and figure',

  /**
   * Original prose, written from the sourced facts below — not copied from any
   * gallery or publication.
   */
  statement: [
    'Karim Abdel Malak paints the figure the way weather paints a wall — in layers, patiently, until the surface remembers everything that passed over it.',
    'Trained as a graphic designer and working now in mixed media, he builds each canvas from acrylic, texture and printed incident, then lets trees, branches, birds and small dwellings grow through the body of the work until figure and landscape stop being separable.',
  ],

  facts: {
    education: {
      value: 'Faculty of Fine Arts, Minya University — Graphic Design',
      source: SOURCES.safarkhanBio,
    },
    beginnings: {
      value:
        'Began as an illustrator for local magazines while developing a parallel practice in sculpture.',
      source: SOURCES.safarkhanBio,
    },
    medium: {
      value:
        'Mixed media — graphic-design elements combined with acrylic painting and textured oils.',
      source: SOURCES.safarkhanBio,
    },
    palette: {
      value:
        'A monotone palette steeped in wooden and earthen tones.',
      source: SOURCES.welum,
    },
    motifs: {
      value:
        'Trees and their branches, birds and dwellings, meshed together with the human figure.',
      source: SOURCES.welum,
    },
    themes: {
      value:
        'Spirituality, belief, compassion and affection, explored through serene renditions of the feminine form.',
      source: SOURCES.safarkhanBio,
    },
    representation: {
      value: 'Part of the Safarkhan Art Gallery roster since 2016.',
      source: SOURCES.safarkhanBio,
    },
    museum: {
      value:
        "A consignment of works selected by the Ministry of Culture for exhibition at Cairo's Museum of Modern Art.",
      source: SOURCES.safarkhanBio,
    },
  },

  /** Chronological career markers. Each is independently sourced. */
  timeline: [
    {
      year: '1993',
      title: 'Silver medal',
      detail: "Shankar's World Association international competition, India.",
      source: SOURCES.safarkhanBio,
    },
    {
      year: '2001',
      title: 'First exhibitions in Egypt',
      detail: 'The beginning of a continuing run of exhibitions across the country.',
      source: SOURCES.safarkhanBio,
    },
    {
      year: '2013',
      title: 'Caravan Festival — London',
      detail: 'Part of the Caravan Festival for the arts.',
      source: SOURCES.welum,
    },
    {
      year: '2014',
      title: 'Caravan Festival — Washington',
      detail: 'Part of the Caravan Festival for the arts.',
      source: SOURCES.welum,
    },
    {
      year: '2015',
      title: 'Caravan Festival — Paris',
      detail: 'Part of the Caravan Festival for the arts.',
      source: SOURCES.welum,
    },
    {
      year: '2016',
      title: 'Joins Safarkhan',
      detail: 'Begins a continuing relationship with Safarkhan Art Gallery, Cairo.',
      source: SOURCES.safarkhanBio,
    },
  ],

  gallery: {
    name: 'Safarkhan Art Gallery',
    address: '6 Brazil Street, Zamalek, Cairo, Egypt',
    hours: [
      ['Monday — Saturday', '11:00 — 20:00'],
      ['Friday', '13:00 — 20:00'],
      ['Sunday', 'Closed'],
    ] as const,
    source: SOURCES.safarkhanExhibitions,
  },

  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/karimabdelmalak/', source: SOURCES.instagram },
  ],
} as const;

/**
 * Rendered by the UI wherever a real value is required but none could be
 * verified. Keeping this list in code means a gap can never quietly become a
 * plausible-looking invention.
 */
export const MISSING_CONTENT = [
  'Artwork image files (originals or gallery-approved reproductions).',
  'Per-artwork titles, years, media, and dimensions.',
  'A portrait photograph of the artist.',
  "The artist's own about-page wording, to replace the prose written here from secondary sources.",
  'A direct enquiry email address or phone number.',
  'Social profiles beyond Instagram.',
] as const;
