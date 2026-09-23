import type { Page } from '@playwright/test';

/** Every route the site serves, plus one representative of each dynamic shape. */
export const ROUTES = [
  '/',
  '/about',
  '/contact',
  '/exhibitions',
  '/illustrations',
  '/interviews',
  '/exhibitions/wsal-2025',
  '/exhibitions/wsal-2025/1',
] as const;

/** The three widths the project has always been checked at. */
export const WIDTHS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

/**
 * Scrolls a page from top to bottom in viewport-sized steps.
 *
 * Uses the wheel rather than `window.scrollTo`, because Lenis intercepts
 * wheel input and drives its own scroll position — a programmatic jump would
 * bypass it and is not what a visitor does.
 */
export async function scrollThrough(page: Page) {
  const viewport = page.viewportSize()?.height ?? 900;
  let previous = -1;

  for (let i = 0; i < 60; i += 1) {
    const position = await page.evaluate(() => window.scrollY);
    const atBottom = await page.evaluate(
      () => window.scrollY + window.innerHeight >= document.body.scrollHeight - 4,
    );
    if (atBottom || position === previous) break;
    previous = position;
    await page.mouse.wheel(0, viewport * 0.8);
    await page.waitForTimeout(160);
  }

  // Let the last batch of observers fire and their transitions settle.
  await page.waitForTimeout(600);
}

/**
 * Collects console errors and failed requests for the life of a page.
 *
 * Returns getters rather than arrays so a test reads them after navigating.
 */
export function watchForErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    // Playwright reports a navigation the test itself aborted as a failure.
    const failure = request.failure()?.errorText ?? '';
    if (failure.includes('net::ERR_ABORTED')) return;
    failedRequests.push(`${request.url()} — ${failure}`);
  });

  return {
    get consoleErrors() {
      return consoleErrors;
    },
    get pageErrors() {
      return pageErrors;
    },
    get failedRequests() {
      return failedRequests;
    },
  };
}
