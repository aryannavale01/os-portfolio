import { test, expect } from './fixtures';
import { waitForDesktop, openAppFromDock } from './helpers';

// ---------------------------------------------------------------------------
// Visual Regression Tests
//
// These tests capture screenshots of key UI states. On the FIRST run they
// create baseline screenshots under e2e/snapshots/. On subsequent runs they
// compare the current rendering against those baselines and flag any pixel
// differences that exceed Playwright's default threshold.
//
// To UPDATE baselines (after intentional UI changes), run:
//   npx playwright test --update-snapshots
//
// The generated baseline images become the "known good" reference.
// ---------------------------------------------------------------------------

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);
  });

  test('fresh desktop load', async ({ page }) => {
    // Dismiss fullscreen prompt if present
    const dismissBtn = page.locator('button:has-text("Got It")');
    if (await dismissBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dismissBtn.click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('fresh-desktop.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Finder window open', async ({ page }) => {
    await openAppFromDock(page, 'Finder');
    await page.waitForTimeout(600);

    await expect(page).toHaveScreenshot('finder-open.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Ask Ultron chat window', async ({ page }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(600);

    await expect(page).toHaveScreenshot('ask-ultron-open.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Terminal window', async ({ page }) => {
    await openAppFromDock(page, 'Terminal');
    await page.waitForTimeout(600);

    await expect(page).toHaveScreenshot('terminal-open.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});
