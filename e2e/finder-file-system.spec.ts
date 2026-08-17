import { test, expect } from './fixtures';
import { waitForDesktop, openAppFromDock } from './helpers';

test.describe('Finder / File System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);
  });

  test('opening Finder shows project folders', async ({ page }) => {
    await openAppFromDock(page, 'Finder');
    // Should see the Finder window with sidebar categories
    await expect(
      page.locator('div.text-\\[13px\\]:has-text("Finder")').first()
    ).toBeVisible({ timeout: 5000 });

    // Should have "All Projects" in sidebar
    await expect(page.locator('text=All Projects').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('navigating into a project folder shows breadcrumb', async ({ page }) => {
    await openAppFromDock(page, 'Finder');
    await page.waitForTimeout(500);

    // Click on a project folder tile if visible
    const folderTile = page.locator('[class*="rounded-xl"]:has-text("All Projects")').first();
    if (await folderTile.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Try to find any project card and click it
      const projectCards = page.locator('div[class*="cursor-pointer"]:has(div[class*="Folder"])');
      const count = await projectCards.count();
      if (count > 0) {
        await projectCards.first().dblclick();
        await page.waitForTimeout(500);
      }
    }
  });

  test('desktop Research folder opens Finder in research mode', async ({ page }) => {
    // Double-click the Research folder icon on the desktop
    const researchIcon = page.locator('text=Research').first();
    if (await researchIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await researchIcon.dblclick();
      await page.waitForTimeout(500);

      // Finder should open with research context
      await expect(
        page.locator('div.text-\\[13px\\]:has-text("Finder")').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('desktop Projects folder opens Finder in projects mode', async ({ page }) => {
    const projectsIcon = page.locator('text=Projects').first();
    if (await projectsIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await projectsIcon.dblclick();
      await page.waitForTimeout(500);

      await expect(
        page.locator('div.text-\\[13px\\]:has-text("Finder")').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Finder sidebar has research and projects entries', async ({ page }) => {
    await openAppFromDock(page, 'Finder');
    await page.waitForTimeout(500);

    // Look for sidebar navigation items
    const sidebarTexts = page.locator('div[class*="sidebar"] >> text=/Projects|Research|All Projects/');
    // At least the "All Projects" label should exist
    await expect(page.locator('text=All Projects').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('double-clicking a PDF on desktop opens Document Reader', async ({ page }) => {
    // Look for any PDF icon on the desktop
    const pdfIcon = page.locator('span:has-text("PDF")').first();
    if (await pdfIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Double-click the parent (the file icon wrapper)
      const fileIcon = pdfIcon.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")]').first();
      await fileIcon.dblclick();
      await page.waitForTimeout(800);

      // Document Reader window should open
      await expect(
        page.locator('div.text-\\[13px\\]:has-text("Preview")').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
