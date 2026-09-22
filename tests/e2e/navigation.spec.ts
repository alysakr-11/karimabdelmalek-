import { test, expect } from '@playwright/test';

test('the old Wix paths are permanently redirected', async ({ request }) => {
  // The redirect map is what keeps existing links and search results alive
  // after the Wix site is replaced. A wrong entry is worse than none.
  const response = await request.get('/copy-of-zat', { maxRedirects: 0 });
  expect([301, 308]).toContain(response.status());
  expect(response.headers()['location']).toBeTruthy();
});

test('an in-page anchor updates the hash without a full document load', async ({ page }) => {
  await page.goto('/');

  // Tag the document so a real navigation is detectable.
  await page.evaluate(() => {
    (window as unknown as { __stayed: boolean }).__stayed = true;
  });

  await page.getByRole('link', { name: 'Skip to content' }).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  await expect(page).toHaveURL(/#main$/);
  const stayed = await page.evaluate(
    () => (window as unknown as { __stayed?: boolean }).__stayed === true,
  );
  expect(stayed, 'the anchor caused a full page load instead of scrolling').toBe(true);
});

test('the footer states what the archive could not supply', async ({ page }) => {
  // gaps.ts renders here on purpose: the site says it is incomplete rather
  // than looking finished while it is not.
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText(/titles|missing|not|supplied/i);
});
