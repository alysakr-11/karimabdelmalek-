import { test, expect } from '@playwright/test';
import { ROUTES, WIDTHS, scrollThrough } from './helpers';

/**
 * Horizontal overflow is the failure this design is most exposed to: the
 * contour fields, the arc strip and the oversized display headings all paint
 * beyond their boxes by intent, and any one of them can push the page wide.
 */
test.describe('no horizontal overflow', () => {
  for (const { name, width, height } of WIDTHS) {
    for (const route of ROUTES) {
      test(`${route} at ${name} (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(route);
        await scrollThrough(page);

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        // One pixel of slack for sub-pixel rounding in the notch geometry.
        expect(
          scrollWidth,
          `${route} overflows by ${scrollWidth - clientWidth}px at ${width}px`,
        ).toBeLessThanOrEqual(clientWidth + 1);
      });
    }
  }
});

test.describe('display headings', () => {
  for (const { name, width, height } of WIDTHS) {
    test(`are not clipped by their mask at ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      const headings = page.locator('.t-display');
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i += 1) {
        const heading = headings.nth(i);
        if (!(await heading.isVisible())) continue;

        const box = await heading.boundingBox();
        if (!box) continue;
        expect(box.height, 'a display heading collapsed to nothing').toBeGreaterThan(0);
        expect(box.x, 'a display heading starts off the left edge').toBeGreaterThanOrEqual(-1);
      }
    });
  }
});
