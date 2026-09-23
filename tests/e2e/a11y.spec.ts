import { test, expect } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('landmarks and headings', () => {
  for (const route of ROUTES) {
    test(`${route} has one main, one h1, and no skipped heading levels`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('header')).toHaveCount(1);
      await expect(page.locator('footer')).toHaveCount(1);

      const levels = await page.evaluate(() =>
        [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
          .filter((el) => (el as HTMLElement).offsetParent !== null || el.tagName === 'H1')
          .map((el) => Number(el.tagName[1])),
      );

      for (let i = 1; i < levels.length; i += 1) {
        expect(
          levels[i] - levels[i - 1],
          `heading order jumps from h${levels[i - 1]} to h${levels[i]} on ${route}`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe('skip link', () => {
  test('is the first thing reached by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    // It is sr-only until focused, then must actually be seen.
    await expect(skip).toBeVisible();
  });

  /**
   * The point of a skip link is not the scroll, it is the focus move. Lenis
   * intercepts fragment links and calls preventDefault, which cancels the
   * browser's own focus handling — so this is asserted explicitly rather than
   * assumed from the URL.
   */
  test('moves focus into main, so the next Tab is past the header', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);

    const landed = await page.evaluate(() => {
      const active = document.activeElement;
      const main = document.querySelector('main');
      return {
        isMain: active === main,
        insideMain: !!(main && active && main.contains(active)),
      };
    });
    expect(landed.isMain || landed.insideMain, 'focus should be in main').toBe(true);

    // And the tab after it must not be back in the header.
    await page.keyboard.press('Tab');
    const next = await page.evaluate(() => {
      const active = document.activeElement;
      const header = document.querySelector('header');
      return !!(header && active && header.contains(active));
    });
    expect(next, 'the next Tab went back into the header — nothing was skipped').toBe(false);
  });
});

test.describe('artwork cards', () => {
  test('every card is a real link with an accessible name', async ({ page }) => {
    await page.goto('/exhibitions/wsal-2025');

    const cards = page.locator('main a[href^="/exhibitions/wsal-2025/"]');
    const count = await cards.count();
    expect(count, 'the exhibition should render its plates').toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i += 1) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute('href', /\/exhibitions\/wsal-2025\/\d+/);
      const image = card.locator('img').first();
      const alt = await image.getAttribute('alt');
      expect(alt, 'every artwork image needs an alt').toBeTruthy();
    }
  });

  test('keyboard focus rings a card exactly as hover does', async ({ page }) => {
    await page.goto('/exhibitions/wsal-2025');

    const card = page.locator('main a[href^="/exhibitions/wsal-2025/"]').first();
    // The ring is a box-shadow on the frame inside the link.
    const frame = card.locator('> div');
    const ring = () => frame.evaluate((el) => getComputedStyle(el).boxShadow);

    await page.mouse.move(0, 0);
    const resting = await ring();

    await card.hover();
    await page.waitForTimeout(600);
    const hovered = await ring();
    expect(hovered, 'hover should change the ring').not.toBe(resting);

    // Move the pointer away, then arrive by keyboard instead.
    await page.mouse.move(0, 0);
    await page.waitForTimeout(600);
    await card.focus();
    await page.waitForTimeout(600);
    expect(await ring(), 'focus must do what hover does').toBe(hovered);
  });
});

test.describe('images', () => {
  test('no image on a gallery page is missing its alt text', async ({ page }) => {
    await page.goto('/illustrations');
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('main img')]
        .filter((img) => !img.getAttribute('alt'))
        .map((img) => (img as HTMLImageElement).src),
    );
    expect(missing).toEqual([]);
  });
});
