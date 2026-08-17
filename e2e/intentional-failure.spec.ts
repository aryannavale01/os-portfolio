import { test, expect } from './fixtures';

// ---------------------------------------------------------------------------
// Intentionally-Broken Test
//
// This test is DESIGNED to fail. It verifies that the test infrastructure is
// actually working and not silently passing everything. After the full suite
// runs, this test should appear as a failure in the report, proving that the
// test runner detects real assertion failures.
// ---------------------------------------------------------------------------

test.describe('Test Infrastructure Sanity Check', () => {
  test('intentionally fails to prove tests actually catch bugs', async ({
    page,
  }) => {
    await page.goto('/');
    // This assertion is always wrong — 1 + 1 !== 999
    expect(1 + 1).toBe(999);
  });
});
