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
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Web path for a media file recorded in the export as `media/...`. */
export const mediaUrl = (localPath: string) =>
  `${BASE_PATH}/${localPath.replace(/^\/+/, '')}`;
