/**
 * What the archive could not supply.
 *
 * Mirrors docs/DATA_GAPS.md. The footer renders this, so the site states its
 * own incompleteness rather than looking finished while it is not. Delete an
 * entry as it is satisfied.
 */
export const MISSING_CONTENT = [
  'Titles, medium, size and year for the artworks — the source site shows images with no captions.',
  'Exhibition statements for the six solo shows (only Caravan Arts has text).',
  'Interview video files or links, and air dates — only the poster frames could be captured.',
  'A published email address, and a delivery address for the contact form.',
  'A year and description for the “Collection” gallery.',
  'Confirmation of the transliterations: Wsal, Rosalyoussef, Shankar’s.',
] as const;
