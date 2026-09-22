import { test, expect } from '@playwright/test';
import { ROUTES } from './helpers';

/**
 * Under `prefers-reduced-motion: reduce` the site must strip transforms and
 * transitions, skip Lenis, and force every reveal to its final state.
 */
test.use({ reducedMotion: 'reduce' });

test.describe('prefers-reduced-motion', () => {
  for (const route of ROUTES) {
    test(`${route} shows everything without scrolling`, async ({ page }) => {
      await page.goto(route);

      // No scrolling at all: with motion reduced, reveals must not gate content.
      const hidden = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('.reveal')) {
          const style = getComputedStyle(el);
          if (style.opacity !== '' && Number(style.opacity) < 0.99) {
            out.push(el.className);
          }
        }
        return out;
      });

      expect(hidden, `reveals not at final state on ${route}`).toEqual([]);
    });
  }

  test('smooth scroll is not installed', async ({ page }) => {
    await page.goto('/');
    // Lenis adds its own class/attribute to the root when it takes over.
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/lenis-smooth/);
  });

  test('the page still scrolls natively', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});
