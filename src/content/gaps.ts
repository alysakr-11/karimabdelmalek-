/**
 * What the archive could not supply — a working list for whoever maintains
 * the site, mirroring docs/DATA_GAPS.md.
 *
 * It used to render in the footer of every page and in a "Still to come" box
 * on /about. That was honest while the site was being built, but on a
 * delivered site it reads to a visitor as unfinished work, so it is no longer
 * shown anywhere. The site already handles each gap gracefully on the page
 * itself (an untitled work is labelled by plate number, a missing field is
 * simply left out). Delete an entry as it is satisfied.
 */
export const MISSING_CONTENT = [
  'Titles, medium, size and year for the artworks outside Wesāl and Zāt — the source site shows images with no captions, and no catalogue exists for the other six shows.',
  'Confirmation of the two sculptures in Wesāl and the two Zāt highchairs, which the gallery catalogue lists but which could not be matched to a plate with certainty.',
  'Exhibition statements for the six solo shows (only Caravan Arts has text).',
  'Air dates for the interviews, and a presenter name for the ON TV appearance.',
  'A year and description for the “Collection” gallery.',
  'Confirmation of the transliterations: Wsal, Rosalyoussef, Shankar’s.',
] as const;
