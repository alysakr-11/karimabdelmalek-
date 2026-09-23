import { test, expect, type Page, type Locator } from '@playwright/test';

// A work opened on its own, full screen, to zoom into and move around.
const viewer = (page: Page) => page.locator('[role="dialog"][aria-modal="true"][data-lenis-prevent]');

/** The zoom factor currently applied to the picture. */
async function scaleOf(dialog: Locator) {
  return dialog.locator('[style*="scale("]').first().evaluate((el) => {
    const m = (el as HTMLElement).style.transform.match(/scale\(([\d.]+)\)/);
    return m ? Number(m[1]) : 1;
  });
}

test('a work opens full screen, zooms, fits again, and closes back to its page', async ({ page }) => {
  await page.goto('/exhibitions/the-third-eye-2021/1');
  await page.getByRole('button', { name: /full screen$/ }).click();

  const dialog = viewer(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toBeVisible();
  expect(await scaleOf(dialog)).toBe(1);

  await dialog.getByRole('button', { name: 'Zoom in' }).click();
  await expect.poll(() => scaleOf(dialog)).toBeGreaterThan(1);
  await dialog.getByRole('button', { name: 'Fit' }).click();
  await expect.poll(() => scaleOf(dialog)).toBe(1);

  // Escape closes the picture only, not the work's page behind it.
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/the-third-eye-2021\/1$/);
});

test('double-click zooms in and back out; a click on the dark ground closes', async ({ page }) => {
  await page.goto('/exhibitions/the-third-eye-2021/1');
  await page.getByRole('button', { name: /full screen$/ }).click();
  const dialog = viewer(page);
  const picture = dialog.getByRole('img');

  await picture.dblclick();
  await expect.poll(() => scaleOf(dialog)).toBeGreaterThan(1);
  await picture.dblclick();
  await expect.poll(() => scaleOf(dialog)).toBe(1);
  // Let the zoom-out finish: until it does, the picture still covers the spot.
  await page.waitForTimeout(400);

  await page.mouse.click(8, 450);
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/the-third-eye-2021\/1$/);
});

test('illustrations open in place and step through the set', async ({ page }) => {
  await page.goto('/illustrations');
  await page.locator('main a[href$=".jpg"]').first().click();

  const dialog = viewer(page);
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/illustrations$/);
  const first = await dialog.getByRole('img').getAttribute('src');

  await page.keyboard.press('ArrowRight');
  await expect.poll(() => dialog.getByRole('img').getAttribute('src')).not.toBe(first);

  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toHaveCount(0);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('pinch zooms and a drag moves around; there are no zoom buttons', async ({ page }) => {
    await page.goto('/exhibitions/the-third-eye-2021/1');
    await page.getByRole('button', { name: /full screen$/ }).tap();
    const dialog = viewer(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Zoom in' })).toBeHidden();

    // Two fingers spreading apart from the middle of the screen.
    await dialog.evaluate((el) => {
      const stage = el.firstElementChild as HTMLElement;
      const fire = (type: string, id: number, x: number) =>
        stage.dispatchEvent(
          new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: 420, bubbles: true, isPrimary: id === 1 }),
        );
      fire('pointerdown', 1, 170);
      fire('pointerdown', 2, 220);
      for (let i = 1; i <= 8; i += 1) {
        fire('pointermove', 1, 170 - i * 12);
        fire('pointermove', 2, 220 + i * 12);
      }
      fire('pointerup', 1, 74);
      fire('pointerup', 2, 316);
    });
    const zoomed = await scaleOf(dialog);
    expect(zoomed).toBeGreaterThan(2);

    // One finger drags the zoomed picture.
    const panBefore = await dialog.locator('[style*="scale("]').first().evaluate((el) => (el as HTMLElement).style.transform);
    await dialog.evaluate((el) => {
      const stage = el.firstElementChild as HTMLElement;
      const fire = (type: string, x: number) =>
        stage.dispatchEvent(new PointerEvent(type, { pointerId: 3, pointerType: 'touch', clientX: x, clientY: 420, bubbles: true, isPrimary: true }));
      fire('pointerdown', 200);
      for (let i = 1; i <= 6; i += 1) fire('pointermove', 200 + i * 15);
      fire('pointerup', 290);
    });
    const panAfter = await dialog.locator('[style*="scale("]').first().evaluate((el) => (el as HTMLElement).style.transform);
    expect(panAfter).not.toBe(panBefore);
    expect(await scaleOf(dialog)).toBe(zoomed);

    await dialog.getByRole('button', { name: 'Close' }).tap();
    await expect(dialog).toHaveCount(0);
  });
});
