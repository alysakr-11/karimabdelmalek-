import { test, expect } from '@playwright/test';
import { ROUTES, scrollThrough } from './helpers';

/**
 * `Reveal` starts shown and only hides once its observer is confirmed running,
 * so the failure mode it guards against is content stranded invisible. These
 * tests assert that guarantee from the outside.
 */
test.describe('nothing is left stranded invisible', () => {
  for (const route of ROUTES) {
    test(route, async ({ page }) => {
      await page.goto(route);
      await scrollThrough(page);

      const stranded = await page.evaluate(() => {
        const hidden: string[] = [];
        for (const el of document.querySelectorAll('[data-shown="false"]')) {
          const rect = el.getBoundingClientRect();
          // Only count it against us if it has been scrolled past: an element
          // still below the fold is legitimately waiting its turn.
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            hidden.push(el.className || el.tagName);
          }
        }
        return hidden;
      });

      expect(stranded, `reveals still hidden in view on ${route}`).toEqual([]);
    });
  }
});

test('content is visible with JavaScript disabled', async ({ browser }) => {
  // The whole point of Reveal starting shown: no JS, no observer, no hiding.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  // Wait for the document, not for every image: what is under test is whether
  // the content shows, and on a cold CI runner one image being optimised for
  // the first time once held the "load" event past the test timeout.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1').first()).toBeVisible();

  const hidden = await page.evaluate(
    () => document.querySelectorAll('[data-shown="false"]').length,
  );
  expect(hidden, 'nothing should be hidden when JS never runs').toBe(0);

  await context.close();
});
