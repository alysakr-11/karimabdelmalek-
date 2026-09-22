import siteData from './data/site.json' with { type: 'json' };

/**
 * Two builds come out of this file.
 *
 * The normal one is a Next server build: images are optimised on demand and
 * the old Wix URLs are redirected. That is what a real host runs.
 *
 * Setting `PAGES_EXPORT=1` produces a static export instead, for publishing to
 * GitHub Pages, which serves files and nothing else. That build cannot
 * optimise images or answer a redirect, so both are turned off rather than
 * left to fail silently. `PAGES_BASE_PATH` is the sub-path Pages serves the
 * site from (`/<repo>`), and every link and asset URL is prefixed with it.
 */
const isExport = process.env.PAGES_EXPORT === '1';
const basePath = process.env.PAGES_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
    // A static host has no optimiser to call.
    ...(isExport ? { unoptimized: true } : {}),
  },
  ...(isExport
    ? {
        output: 'export',
        basePath,
        // Pages serves /<repo>/about/ as a directory, so emit about/index.html.
        trailingSlash: true,
      }
    : {
        /**
         * The old Wix URLs are permanently redirected so existing links,
         * bookmarks and search results keep working. The mapping lives in
         * data/site.json — note the old slugs do NOT match their contents
         * (see docs/SITE_MAP.md).
         */
        async redirects() {
          return siteData.redirects.map((r) => ({
            source: r.old,
            destination: r.new,
            permanent: true,
          }));
        },
      }),
};

export default nextConfig;
