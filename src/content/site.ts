import siteJson from '@data/site.json';

/**
 * Site-level content, read straight from the archive export in `data/`.
 *
 * `data/` is the single source of truth for everything the old site
 * contained. Nothing here is hand-copied: change the JSON, not this file.
 */

export type NavItem = { label: string; href: string };
export type Social = { platform: string; handle: string; url: string };

/** The artist's own spelling, as it appears on his site. */
export const SITE_NAME = siteJson.site_name;

/** Rendered as a stacked two-line logotype. */
export const LOGOTYPE = ['KARIM', 'ABD ELMALAK'] as const;

export const nav: NavItem[] = siteJson.navigation
  .filter((item) => item.new_path !== '/')
  .map((item) => ({ label: item.label, href: item.new_path }));

export const socials: Social[] = siteJson.socials;

/** Old Wix paths, consumed by next.config.mjs to keep existing links alive. */
export const redirects = siteJson.redirects;

/**
 * Where the site is served from, when that is not the domain root.
 *
 * A static export published to GitHub Pages lives under `/<repo>/`. Next
 * rewrites its own links and chunk URLs for that, but an `<Image>` whose src
 * this function built is left alone once optimisation is off — so the prefix
 * has to be applied here, or every picture 404s on Pages and nowhere else.
 * Empty for a normal deploy, which is served from the root.
 */
/**
 * The address this site is served from — for canonical URLs, the sitemap,
 * robots.txt and link previews. Server-side only; nothing in the browser
 * needs it.
 *
 * In order of precedence:
 *   1. NEXT_PUBLIC_SITE_URL, when a host sets one explicitly;
 *   2. VERCEL_PROJECT_PRODUCTION_URL, which Vercel sets on every build to the
 *      project's production domain — the .vercel.app address today, and the
 *      artist's own domain automatically once one is attached;
 *   3. the artist's own domain, for any other host.
 *
 * It used to be (1) or (3) only. On Vercel that meant every canonical URL and
 * every share image pointed at www.karimabdelmalak.com — still the old Wix
 * site — so a shared link previewed with no picture, and search engines were
 * told the real pages lived on Wix.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '') ||
  'https://www.karimabdelmalak.com'
).replace(/\/+$/, '');

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Web path for a media file recorded in the export as `media/...`. */
export const mediaUrl = (localPath: string) =>
  `${BASE_PATH}/${localPath.replace(/^\/+/, '')}`;
