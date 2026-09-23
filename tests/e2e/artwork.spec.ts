import { test, expect, type Page } from '@playwright/test';

// A work's page behaves like a viewer: it can be closed, and moved through.
const close = (page: Page) => page.getByRole('button', { name: /^Close and return to/ });

test('closing a work opened from the grid returns to the grid, after browsing', async ({ page }) => {
  await page.goto('/exhibitions/the-third-eye-2021');
  await page.locator('a[href="/exhibitions/the-third-eye-2021/1"]').first().click();
  await expect(page).toHaveURL(/\/the-third-eye-2021\/1$/);

  // Look at two more works, then close once.
  await page.getByRole('link', { name: 'Next work' }).click();
  await expect(page).toHaveURL(/\/the-third-eye-2021\/2$/);
  await page.getByRole('link', { name: 'Next work' }).click();
  await expect(page).toHaveURL(/\/the-third-eye-2021\/3$/);

  await close(page).click();
  await expect(page).toHaveURL(/\/exhibitions\/the-third-eye-2021$/);
});

test('closing a work landed on directly opens its exhibition', async ({ page }) => {
  await page.goto('/exhibitions/the-third-eye-2021/4');
  await close(page).click();
  await expect(page).toHaveURL(/\/exhibitions\/the-third-eye-2021$/);
});

test('Escape closes, and the arrow keys move between works', async ({ page }) => {
  await page.goto('/exhibitions/the-third-eye-2021/1');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/the-third-eye-2021\/2$/);
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/\/the-third-eye-2021\/1$/);
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/\/the-third-eye-2021\/13$/);

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/exhibitions\/the-third-eye-2021$/);
});

test('an untitled work is headed by its exhibition, not a plate number', async ({ page }) => {
  await page.goto('/exhibitions/the-third-eye-2021/1');
  await expect(page.locator('h1')).toHaveText('The Third Eye');
  await expect(page.locator('main')).not.toContainText(/Plate 0|published without a title/);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('swiping the picture moves to the next work', async ({ page }) => {
    await page.goto('/exhibitions/the-third-eye-2021/1');
    await page.locator('main img').first().evaluate((img) => {
      const el = img.closest('[style*="pan-y"]')!;
      const r = el.getBoundingClientRect();
      const y = r.top + r.height / 2;
      const t = (x: number) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [t(r.right - 20)], changedTouches: [t(r.right - 20)], bubbles: true }));
      el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(r.left + 20)], bubbles: true }));
    });
    await expect(page).toHaveURL(/\/the-third-eye-2021\/2$/);
  });
});
