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
 * Contrast pairs that are known to fail and are waiting on a palette decision
 * (issue #4). Listed as foreground-on-background so a new failure is
 * distinguishable from these rather than lost among them.
 *
 * Nothing else may fail. This is a ratchet, not a mute: an unlisted pair fails
 * the run, and a listed pair that gets fixed should be deleted from here.
 */
const KNOWN_CONTRAST_FAILURES = new Set([
  // The "Enquire" button in the header, on every route. 3.43:1 at 11px bold.
  // Its hover state (chalk on clay) already passes at 5.43:1.
  '#f5f1e9 on #b4732e',
  // Eyebrow labels set in ink-muted on the deep paper ground. 4.15:1.
  '#756a5a on #eae3d6',
  // The same eyebrow colour on the plain paper ground. 4.38:1.
  '#756a5a on #f1ece2',
]);

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
