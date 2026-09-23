import { test, expect, type Page } from '@playwright/test';

// The home page hero is a slideshow of a selection of the work. Every work
// carries a caption linking to its own page, so the caption's link says which
// work is showing.
const carousel = (page: Page) => page.getByRole('region', { name: 'Selected works' });
const shown = (page: Page) => carousel(page).getByRole('link').first().getAttribute('href');

/** Stop it moving on its own, so each step below is caused by the test. */
async function pause(page: Page) {
  await carousel(page).getByRole('button', { name: 'Pause slideshow' }).click();
  await page.mouse.move(0, 0);
}

/** A one-finger sideways drag across the middle of the picture. */
async function swipe(page: Page, direction: 'left' | 'right') {
  await carousel(page).evaluate((el, direction) => {
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const [from, to] = direction === 'left' ? [r.right - 30, r.left + 30] : [r.left + 30, r.right - 30];
    const touch = (x: number) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
    const fire = (type: string, x: number, down: boolean) =>
      el.dispatchEvent(
        new TouchEvent(type, { touches: down ? [touch(x)] : [], changedTouches: [touch(x)], bubbles: true }),
      );
    fire('touchstart', from, true);
    for (let i = 1; i <= 6; i += 1) fire('touchmove', from + ((to - from) * i) / 6, true);
    fire('touchend', to, false);
  }, direction);
}

test('it opens on The Third Eye and moves on by itself', async ({ page }) => {
  await page.goto('/');
  const first = await shown(page);
  expect(first).toMatch(/^\/exhibitions\/the-third-eye-2021\//);
  await expect.poll(() => shown(page), { timeout: 10_000 }).not.toBe(first);
});

test('clicking the picture opens that work’s page', async ({ page }) => {
  await page.goto('/');
  await pause(page);
  const href = await shown(page);
  await carousel(page).click({ position: { x: 120, y: 120 } });
  await expect(page).toHaveURL(new RegExp(`${href}$`));
});

test('Pause stops it where it is, and Play starts it again', async ({ page }) => {
  await page.goto('/');
  await pause(page);
  const first = await shown(page);

  await page.waitForTimeout(6000);
  expect(await shown(page), 'it advanced while paused').toBe(first);

  await carousel(page).getByRole('button', { name: 'Play slideshow' }).click();
  await expect.poll(() => shown(page), { timeout: 10_000 }).not.toBe(first);
});

test('with reduced motion it does not start moving on its own', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(carousel(page).getByRole('button', { name: 'Play slideshow' })).toBeVisible();
  const first = await shown(page);

  await page.waitForTimeout(6000);
  expect(await shown(page), 'it advanced under reduced motion').toBe(first);
});

test('the arrows stay hidden until the pointer is over the picture', async ({ page }) => {
  await page.goto('/');
  const nextArrow = carousel(page).getByRole('button', { name: 'Next work' });
  await page.mouse.move(0, 0);
  await expect(nextArrow).toHaveCSS('opacity', '0');

  await carousel(page).hover();
  await expect(nextArrow).toHaveCSS('opacity', '1');
});

test('the arrows move forward and back, wrapping at the ends', async ({ page }) => {
  await page.goto('/');
  await pause(page);
  const works = carousel(page);
  const first = await shown(page);

  await works.getByRole('button', { name: 'Next work' }).click();
  const second = await shown(page);
  expect(second).not.toBe(first);

  await works.getByRole('button', { name: 'Previous work' }).click();
  expect(await shown(page)).toBe(first);

  // Back from the first work is the last one, not a dead end.
  await works.getByRole('button', { name: 'Previous work' }).click();
  const last = await shown(page);
  expect(last).not.toBe(first);
  expect(last).not.toBe(second);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('swiping left and right moves through the works', async ({ page }) => {
    await page.goto('/');
    await carousel(page).getByRole('button', { name: 'Pause slideshow' }).tap();
    const first = await shown(page);

    await swipe(page, 'left');
    await expect.poll(() => shown(page)).not.toBe(first);

    await swipe(page, 'right');
    await expect.poll(() => shown(page)).toBe(first);
  });

  test('a swipe does not also open the work', async ({ page }) => {
    await page.goto('/');
    await carousel(page).getByRole('button', { name: 'Pause slideshow' }).tap();
    await swipe(page, 'left');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/$/);
  });
});

test('there is no countdown bar under the picture', async ({ page }) => {
  await page.goto('/');
  // The old progress segments were 2px-tall bars inside the carousel.
  const bars = await carousel(page).evaluate(
    (el) => [...el.querySelectorAll('span')].filter((s) => s.getBoundingClientRect().height === 2).length,
  );
  expect(bars).toBe(0);
});
