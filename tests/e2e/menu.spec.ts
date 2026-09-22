import { test, expect } from '@playwright/test';

/**
 * The navigation overlay.
 *
 * This is the most accessibility-sensitive component on the site and it has
 * regressed before — the closed menu was once left in the tab order (PR #3),
 * which is exactly what the `inert` assertion here would have caught.
 */
const trigger = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Open navigation menu' });

const dialog = (page: import('@playwright/test').Page) =>
  page.locator('[role="dialog"][aria-label="Site navigation"]');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('the closed menu is inert and hidden from assistive tech', async ({ page }) => {
  const menu = dialog(page);

  expect(await menu.evaluate((el: HTMLElement) => el.inert)).toBe(true);
  await expect(menu).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
});

test('no link inside the closed menu can be reached by keyboard', async ({ page }) => {
  // Tab a good way into the page and check focus never lands inside the menu.
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press('Tab');
    const insideMenu = await page.evaluate(() => {
      const active = document.activeElement;
      const menu = document.querySelector('[role="dialog"][aria-label="Site navigation"]');
      return !!(active && menu && menu.contains(active));
    });
    expect(insideMenu, `focus entered the closed menu after ${i + 1} tabs`).toBe(false);
  }
});

test('opening moves focus in, locks scroll, and marks the dialog live', async ({ page }) => {
  await trigger(page).click();

  const menu = dialog(page);
  await expect(menu).toHaveAttribute('aria-hidden', 'false');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  expect(await menu.evaluate((el: HTMLElement) => el.inert)).toBe(false);

  // Focus moved inside.
  const focusInside = await page.evaluate(() => {
    const active = document.activeElement;
    const el = document.querySelector('[role="dialog"][aria-label="Site navigation"]');
    return !!(active && el && el.contains(active));
  });
  expect(focusInside, 'focus should move into the dialog on open').toBe(true);

  // Background scrolling is locked.
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
});

test('Tab cycles within the dialog rather than escaping it', async ({ page }) => {
  await trigger(page).click();

  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    const insideMenu = await page.evaluate(() => {
      const active = document.activeElement;
      const menu = document.querySelector('[role="dialog"][aria-label="Site navigation"]');
      return !!(active && menu && menu.contains(active));
    });
    expect(insideMenu, `focus escaped the open dialog after ${i + 1} tabs`).toBe(true);
  }
});

test('Shift+Tab also stays inside', async ({ page }) => {
  await trigger(page).click();

  for (let i = 0; i < 15; i += 1) {
    await page.keyboard.press('Shift+Tab');
    const insideMenu = await page.evaluate(() => {
      const active = document.activeElement;
      const menu = document.querySelector('[role="dialog"][aria-label="Site navigation"]');
      return !!(active && menu && menu.contains(active));
    });
    expect(insideMenu, `focus escaped backwards after ${i + 1} shift-tabs`).toBe(true);
  }
});

test('Escape closes, restores focus and unlocks scrolling', async ({ page }) => {
  const scrollBefore = await page.evaluate(() => document.body.style.overflow);

  await trigger(page).click();
  await page.keyboard.press('Escape');

  await expect(dialog(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  expect(await dialog(page).evaluate((el: HTMLElement) => el.inert)).toBe(true);

  // Focus is back on the button that opened it, not lost to the body.
  await expect(trigger(page)).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(scrollBefore);
});

test('the Close button closes it', async ({ page }) => {
  await trigger(page).click();
  await dialog(page).getByRole('button', { name: 'Close' }).click();

  await expect(dialog(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger(page)).toBeFocused();
});

test('a menu link navigates and leaves the menu closed', async ({ page }) => {
  await trigger(page).click();
  await dialog(page).getByRole('link', { name: /about/i }).first().click();

  await expect(page).toHaveURL(/\/about$/);
  await expect(dialog(page)).toHaveAttribute('aria-hidden', 'true');

  // Scrolling must work on the page we landed on.
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
