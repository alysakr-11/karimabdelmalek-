import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests.
 *
 * These run against a real production build, not `next dev` — the reveals,
 * the prerendered routes and the 404 status all behave differently under the
 * dev server, and it is the production output that ships.
 *
 * Only Chromium runs by default, because that is the only engine the project
 * has ever been verified against. WebKit and Firefox are defined but skipped
 * unless `PW_ALL_BROWSERS` is set, so enabling them is a flag rather than a
 * rewrite — see issue #22. They need `npx playwright install` first.
 */
const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const allBrowsers = !!process.env.PW_ALL_BROWSERS;

/**
 * An already-installed Chromium to launch instead of Playwright's own.
 *
 * Playwright pins an exact browser build per release, so a machine that has
 * Chromium from a different Playwright version cannot run these tests without
 * either re-downloading or pointing at what it already has. CI downloads the
 * matching build and leaves this unset; sandboxes and air-gapped machines set
 * it, e.g. PW_CHROMIUM_PATH=/opt/pw-browsers/chromium.
 */
const chromiumPath = process.env.PW_CHROMIUM_PATH;
const launchOptions = chromiumPath ? { executablePath: chromiumPath } : {};

export default defineConfig({
  testDir: './tests/e2e',
  // A stranded-reveal or focus-trap failure is a real bug, never a flake, so
  // nothing is retried locally. CI retries once to absorb runner noise only.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: !!process.env.CI,
  // CI needs the HTML reporter too, or the failure artifact the workflow
  // uploads has nothing to collect.
  reporter: process.env.CI
    ? ([['github'], ['list'], ['html', { open: 'never' }]] as const)
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions } },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],

  webServer: {
    command: `npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // The first request compiles nothing, but it does optimise the hero image,
    // which is currently a 9 MB JPEG (issue #18).
    timeout: 120_000,
  },
});
