import { test, expect } from '@playwright/test';

// The home page hero cycles through a selection of the work. The opening
// painting has no caption; every work after it links to its own page.
const carousel = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Selected works' });

test('the hero moves on to the next work by itself', async ({ page }) => {
  await page.goto('/');
  const works = carousel(page);
  await expect(works.getByRole('link')).toHaveCount(0);
  await expect(works.getByRole('link').first()).toHaveAttribute(
    'href',
    /^\/exhibitions\/[^/]+\/[^/]+$/,
    {
      timeout: 10_000,
    },
  );
});

test('Pause stops the hero where it is, and Play starts it again', async ({
  page,
}) => {
  await page.goto('/');
  const works = carousel(page);
  await works.getByRole('button', { name: 'Pause slideshow' }).click();
  await page.mouse.move(0, 0);

  await page.waitForTimeout(6000);
  await expect(
    works.getByRole('link'),
    'the hero advanced while paused',
  ).toHaveCount(0);

  await works.getByRole('button', { name: 'Play slideshow' }).click();
  await expect(works.getByRole('link').first()).toBeVisible({
    timeout: 10_000,
  });
});

test('with reduced motion the hero does not start moving on its own', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const works = carousel(page);
  await expect(
    works.getByRole('button', { name: 'Play slideshow' }),
  ).toBeVisible();

  await page.waitForTimeout(6000);
  await expect(
    works.getByRole('link'),
    'the hero advanced under reduced motion',
  ).toHaveCount(0);
});
