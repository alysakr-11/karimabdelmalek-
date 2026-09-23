import { test, expect, type Page } from '@playwright/test';

// The home page hero cycles through a selection of the work. The opening
// painting has no caption; every work after it links to its own page.
const carousel = (page: Page) => page.getByRole('region', { name: 'Selected works' });

/** Stop it moving on its own, so each step below is caused by the test. */
async function pause(page: Page) {
  await carousel(page).getByRole('button', { name: 'Pause slideshow' }).click();
  await page.mouse.move(0, 0);
}

/** A one-finger sideways swipe across the middle of the picture. */
async function swipe(page: Page, direction: 'left' | 'right') {
  await carousel(page).evaluate((el, direction) => {
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const [from, to] = direction === 'left' ? [r.right - 30, r.left + 30] : [r.left + 30, r.right - 30];
    const touch = (x: number) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(from)], changedTouches: [touch(from)], bubbles: true }));
    el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touch(to)], bubbles: true }));
  }, direction);
}

test('the hero moves on to the next work by itself', async ({ page }) => {
  await page.goto('/');
  const works = carousel(page);
  await expect(works.getByRole('link')).toHaveCount(0);
  await expect(works.getByRole('link').first()).toHaveAttribute('href', /^\/exhibitions\/[^/]+\/[^/]+$/, {
    timeout: 10_000,
  });
});

test('Pause stops the hero where it is, and Play starts it again', async ({ page }) => {
  await page.goto('/');
  const works = carousel(page);
  await pause(page);

  await page.waitForTimeout(6000);
  await expect(works.getByRole('link'), 'the hero advanced while paused').toHaveCount(0);

  await works.getByRole('button', { name: 'Play slideshow' }).click();
  await expect(works.getByRole('link').first()).toBeVisible({ timeout: 10_000 });
});

test('with reduced motion the hero does not start moving on its own', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const works = carousel(page);
  await expect(works.getByRole('button', { name: 'Play slideshow' })).toBeVisible();

  await page.waitForTimeout(6000);
  await expect(works.getByRole('link'), 'the hero advanced under reduced motion').toHaveCount(0);
});

test('the arrows stay hidden until the pointer is over the picture', async ({ page }) => {
  await page.goto('/');
  const works = carousel(page);
  const nextArrow = works.getByRole('button', { name: 'Next work' });
  await page.mouse.move(0, 0);
  await expect(nextArrow).toHaveCSS('opacity', '0');

  await works.hover();
  await expect(nextArrow).toHaveCSS('opacity', '1');
});

test('the arrows move forward and back, wrapping at the ends', async ({ page }) => {
  await page.goto('/');
  const works = carousel(page);
  await pause(page);
  const caption = works.getByRole('link');

  await works.getByRole('button', { name: 'Next work' }).click();
  await expect(caption).toHaveCount(1);
  const second = await caption.getAttribute('href');

  await works.getByRole('button', { name: 'Previous work' }).click();
  await expect(caption).toHaveCount(0);

  // Back from the first work is the last one, not a dead end.
  await works.getByRole('button', { name: 'Previous work' }).click();
  await expect(caption).toHaveCount(1);
  expect(await caption.getAttribute('href')).not.toBe(second);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('swiping left and right moves through the works', async ({ page }) => {
    await page.goto('/');
    const works = carousel(page);
    await works.getByRole('button', { name: 'Pause slideshow' }).tap();
    const caption = works.getByRole('link');
    await expect(caption).toHaveCount(0);

    await swipe(page, 'left');
    await expect(caption).toHaveCount(1);

    await swipe(page, 'right');
    await expect(caption).toHaveCount(0);
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
