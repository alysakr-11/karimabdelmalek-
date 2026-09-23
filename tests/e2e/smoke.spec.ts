import { test, expect } from '@playwright/test';
import { ROUTES, watchForErrors } from './helpers';

test.describe('routes', () => {
  for (const route of ROUTES) {
    test(`${route} returns 200 and renders a heading`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should return 200`).toBe(200);

      // A route that 200s but renders nothing is still broken.
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }

  test('an unknown path returns a real 404, not a 200 page that says 404', async ({ page }) => {
    const response = await page.goto('/not-a-real-page');
    expect(response?.status()).toBe(404);
    await expect(page.locator('main')).toBeVisible();
  });

  test('robots.txt and sitemap.xml are served', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain('<urlset');
    // The sitemap is built from the content, so it should carry the plate
    // pages too — not just the six top-level routes.
    expect(xml).toContain('/exhibitions/wsal-2025');
  });
});

test.describe('console', () => {
  for (const route of ROUTES) {
    test(`${route} logs no errors and fails no requests`, async ({ page }) => {
      const watcher = watchForErrors(page);

      // Deliberately not `networkidle`. Playwright discourages it, and on a
      // gallery route it is unreachable in any bounded time on a slow runner:
      // next/image optimises each plate on first request, and Wesal alone is
      // 24 MB of source JPEG (issue #18). Waiting for the network to fall
      // quiet means waiting for an image encoder, which is not what this test
      // is about. `load` plus a fixed settle window is deterministic, and the
      // listeners below were attached before navigating, so anything that
      // errored or 404'd in that window is still caught.
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1200);

      expect(watcher.pageErrors, `uncaught exceptions on ${route}`).toEqual([]);
      expect(watcher.consoleErrors, `console errors on ${route}`).toEqual([]);
      expect(watcher.failedRequests, `failed requests on ${route}`).toEqual([]);
    });
  }
});
