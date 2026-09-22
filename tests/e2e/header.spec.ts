import { test, expect, type Page } from '@playwright/test';

const INK = 'rgb(22, 18, 13)';
const CHALK = 'rgb(245, 241, 233)';

/** Scroll so the header's probe line (42px down) sits `offset` px into the curve. */
async function probeCurve(page: Page, offset: number) {
  const target = await page.evaluate((offset) => {
    const curve = document.querySelector('#explore')!.firstElementChild!;
    const y = Math.round(curve.getBoundingClientRect().top + window.scrollY - 42 + offset);
    window.scrollTo(0, y);
    return y;
  }, offset);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(target);
}

test('the logo switches colour where the curve does, not where its section starts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const logo = page.locator('header a').first();

  // The curve into the dark index is 80px tall; its top 29% is still the light
  // page. A dark-on-light logo there, and light-on-dark just below. Each step
  // starts from the other colour, so a pass means the logo really switched.
  await probeCurve(page, 100);
  await expect(logo).toHaveCSS('color', CHALK);

  await probeCurve(page, 12);
  await expect(logo).toHaveCSS('color', INK);

  await probeCurve(page, 50);
  await expect(logo).toHaveCSS('color', CHALK);
});

test('a bar sits behind the header once the page scrolls, and not before', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const bar = page.locator('header > div[aria-hidden]');
  await expect(bar).toHaveCSS('opacity', '0');

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(bar).toHaveCSS('opacity', '1');
});
