import siteData from './data/site.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  /**
   * The old Wix URLs are permanently redirected so existing links, bookmarks
   * and search results keep working. The mapping lives in data/site.json —
   * note the old slugs do NOT match their contents (see docs/SITE_MAP.md).
   */
  async redirects() {
    return siteData.redirects.map((r) => ({
      source: r.old,
      destination: r.new,
      permanent: true,
    }));
  },
};

export default nextConfig;
