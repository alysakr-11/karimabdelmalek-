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
      await page.goto(route, { waitUntil: 'networkidle' });

      expect(watcher.pageErrors, `uncaught exceptions on ${route}`).toEqual([]);
      expect(watcher.consoleErrors, `console errors on ${route}`).toEqual([]);
      expect(watcher.failedRequests, `failed requests on ${route}`).toEqual([]);
    });
  }
});
