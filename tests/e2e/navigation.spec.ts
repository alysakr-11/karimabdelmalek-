import { test, expect } from '@playwright/test';

test('the old Wix paths are permanently redirected', async ({ request }) => {
  // The redirect map is what keeps existing links and search results alive
  // after the Wix site is replaced. A wrong entry is worse than none.
  const response = await request.get('/copy-of-zat', { maxRedirects: 0 });
  expect([301, 308]).toContain(response.status());
  expect(response.headers()['location']).toBeTruthy();
});

test('an in-page anchor scrolls in place instead of loading a new document', async ({ page }) => {
  await page.goto('/');

  // Tag the document so a real navigation is detectable.
  await page.evaluate(() => {
    (window as unknown as { __stayed: boolean }).__stayed = true;
  });

  await page.getByRole('link', { name: 'Skip to content' }).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  // Smooth scrolling intercepts the jump, so the hash is deliberately not
  // written; what matters is that the document stayed and focus moved.
  const stayed = await page.evaluate(
    () => (window as unknown as { __stayed?: boolean }).__stayed === true,
  );
  expect(stayed, 'the anchor caused a full page load instead of scrolling').toBe(true);
  await expect(page.locator('main')).toBeFocused();
});

test('the footer does not show visitors the internal to-do list', async ({ page }) => {
  // The list of missing content lives in docs/DATA_GAPS.md for whoever
  // maintains the site. It was once rendered here; on a delivered site it
  // read to every visitor as unfinished work.
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  await expect(footer).not.toContainText(/outstanding|content status|still to come/i);

  await page.goto('/about');
  await expect(page.locator('main')).not.toContainText(/still to come/i);
});
