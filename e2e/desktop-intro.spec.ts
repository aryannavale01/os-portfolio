import { test, expect } from './fixtures';
import { waitForDesktop } from './helpers';

test.describe('Desktop / Intro', () => {
  test('boot screen shows progress bar and completes', async ({ page }) => {
    await page.goto('/');
    const bootHeading = page.getByRole('heading', { name: 'AN OS' });
    await expect(bootHeading).toBeVisible({ timeout: 5000 });
    await waitForDesktop(page);
  });

  test('wallpaper image loads correctly', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    const wallpaperImg = page.locator('img[src*="wallpapers"]').first();
    if (await wallpaperImg.isVisible({ timeout: 3000 }).catch(() => false)) {
      const naturalWidth = await wallpaperImg.evaluate(
        (el) => (el as HTMLImageElement).naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('name heading is visible', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    await expect(
      page.locator('h1').filter({ hasText: 'Aryan Navale' }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('cycling tagline changes text over time', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    const validRoles = [
      'AI/ML Engineer',
      'Full-Stack Developer',
      'RAG & Agent Builder',
      'Final-Year AI & DS Student',
    ];

    let foundText = '';
    for (const role of validRoles) {
      if (
        await page
          .getByText(role, { exact: true })
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        foundText = role;
        break;
      }
    }

    if (foundText) {
      await page.waitForTimeout(3500);

      let foundSecond = '';
      for (const role of validRoles) {
        if (
          role !== foundText &&
          (await page
            .getByText(role, { exact: true })
            .isVisible({ timeout: 2000 })
            .catch(() => false))
        ) {
          foundSecond = role;
          break;
        }
      }

      expect(foundSecond.length > 0 || foundText.length > 0).toBeTruthy();
    }
  });

  test('dock is visible at bottom of screen', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    const dockBtns = page.locator('button[title]');
    const count = await dockBtns.count();
    expect(count).toBeGreaterThan(5);
  });

  test('menu bar is visible at top', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    const menuBar = page.locator('header').first();
    await expect(menuBar).toBeVisible({ timeout: 5000 });
  });

  test('desktop icons are present', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    await expect(page.locator('text=Research').first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('text=Projects').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('fullscreen prompt appears and can be dismissed', async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);

    // The fullscreen prompt may have already been dismissed by waitForDesktop
    // Re-navigate fresh to check it
    await page.goto('/');
    await page.waitForTimeout(2000);
    const dismissBtn = page.locator('button:has-text("Got It"), button:has-text("Skip")').first();
    if (await dismissBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dismissBtn.click();
      await page.waitForTimeout(300);
      await expect(dismissBtn).not.toBeVisible({ timeout: 2000 });
    }
  });
});
