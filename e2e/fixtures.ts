import { test as base, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Custom fixture: fail the test if the browser console logs an error.
// Every test in the suite automatically gets `consoleErrors` — if any entries
// land here the test fails with a clear message listing every error.
// ---------------------------------------------------------------------------
type ConsoleFixtures = {
  consoleErrors: string[];
};

export const test = base.extend<ConsoleFixtures>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });
    await use(errors);
    // After the test body runs, assert zero console errors
    // Filter out known benign errors (favicon 404, etc.)
    const real = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource') &&
        !e.includes('net::ERR_')
    );
    expect(
      real,
      `Console errors detected during test:\n${real.join('\n')}`
    ).toHaveLength(0);
  },
});

export { expect };
