import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';
import { exhibitions } from '@/content/exhibitions';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = ['', '/exhibitions', '/illustrations', '/about', '/interviews', '/contact'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  );

  const exhibitionPages = exhibitions.map((e) => ({
    url: `${SITE_URL}/exhibitions/${e.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const artworkPages = exhibitions.flatMap((e) =>
    e.artworks.map((a) => ({
      url: `${SITE_URL}/exhibitions/${e.slug}/${a.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  );

  return [...pages, ...exhibitionPages, ...artworkPages];
}

export const dynamic = 'force-static';
