import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';

/** Both of these are computed from committed data and never change between
 *  requests, so they are safe to emit as files — which a static export
 *  requires, since there is no server to generate them on demand. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
