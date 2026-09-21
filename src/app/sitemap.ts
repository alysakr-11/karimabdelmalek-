import type { MetadataRoute } from 'next';
import { works } from '@/content/works';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.karimabdelmalak.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['', '/works', '/collections', '/about', '/contact'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const workPages = works.map((work) => ({
    url: `${SITE_URL}/works/${work.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...pages, ...workPages];
}
