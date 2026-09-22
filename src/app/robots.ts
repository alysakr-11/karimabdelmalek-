import type { MetadataRoute } from 'next';

/** Both of these are computed from committed data and never change between
 *  requests, so they are safe to emit as files — which a static export
 *  requires, since there is no server to generate them on demand. */
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.karimabdelmalak.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
