import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from './helpers';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Let the page settle before measuring.
 *
 * This is not politeness, it is correctness. Reveals fade their children in,
 * and axe sampling a half-faded element reads the blended colour as the
 * foreground — which produces contrast ratios near 1.0 for text that is
 * perfectly legible a moment later. Measured on /about: 90 violations at
 * 200ms, 7 at 600ms, 3 from 1500ms onwards. Only the settled figure describes
 * what anyone actually sees.
 */
async function settle(page: import('@playwright/test').Page) {
  await page.waitForTimeout(1500);
}

/**
 * Contrast pairs that are known to fail and are waiting on a decision.
 *
 * Empty: the three pairs once listed here (the Enquire button, and the muted
 * eyebrow labels on both paper grounds) were fixed by darkening the ochre and
 * ink-muted tokens. Any contrast failure now fails the run. Add a pair only
 * with a reason and a plan to remove it.
 */
const KNOWN_CONTRAST_FAILURES = new Set<string>([]);

function pairsFrom(nodes: { any: { message?: string }[] }[]) {
  return nodes.map((node) => {
    const message = node.any[0]?.message ?? '';
    const fg = /foreground color: (#[0-9a-f]{6})/i.exec(message)?.[1] ?? '?';
    const bg = /background color: (#[0-9a-f]{6})/i.exec(message)?.[1] ?? '?';
    return `${fg} on ${bg}`;
  });
}

test.describe('axe', () => {
  for (const route of ROUTES) {
    test(`${route} has no WCAG A/AA violations outside colour contrast`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      const other = results.violations
        .filter((v) => v.id !== 'color-contrast')
        .map((v) => `${v.impact}/${v.id} (${v.nodes.length} nodes)`);

      expect(other, `new accessibility violations on ${route}`).toEqual([]);
    });

    test(`${route} introduces no new contrast failures`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      const nodes = results.violations.find((v) => v.id === 'color-contrast')?.nodes ?? [];

      const unexpected = [...new Set(pairsFrom(nodes))].filter(
        (pair) => !KNOWN_CONTRAST_FAILURES.has(pair),
      );

      expect(
        unexpected,
        `unlisted contrast failures on ${route} — either fix them or, if deliberate, add them to KNOWN_CONTRAST_FAILURES with a reason`,
      ).toEqual([]);
    });
  }
});
