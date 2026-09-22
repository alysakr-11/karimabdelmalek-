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

/** Web path for a media file recorded in the export as `media/...`. */
export const mediaUrl = (localPath: string) => `/${localPath.replace(/^\/+/, '')}`;
