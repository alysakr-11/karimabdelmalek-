import { test, expect } from '@playwright/test';

// The phone number is reached through its Call and WhatsApp buttons; it is
// not written out anywhere on the page.
for (const route of ['/', '/contact', '/about']) {
  test(`${route} shows Call and WhatsApp but not the number written out`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator('body').innerText();
    expect(text.replace(/\s/g, '')).not.toContain('1289993395');

    const call = page.locator('a[href^="tel:"]').first();
    await expect(call).toHaveAttribute('href', /^tel:\+20/);
    await expect(page.locator('a[href^="https://wa.me/"]').first()).toBeAttached();
  });
}
