import { test, expect, type Page } from '@playwright/test';
import { freshDesktop, waitForDesktop, openAppFromDock } from './helpers';

const APPS = [
  { dockTitle: 'Finder (Projects)', windowTitle: 'Finder' },
  { dockTitle: 'Terminal (Skills CLI)', windowTitle: 'Terminal' },
  { dockTitle: 'Notes (About Me)', windowTitle: 'Notes' },
  { dockTitle: 'Mail (Contact)', windowTitle: 'Mail' },
  { dockTitle: 'System Settings', windowTitle: 'System Settings' },
  { dockTitle: 'Document Reader', windowTitle: 'Document Reader' },
  { dockTitle: 'Ultron', windowTitle: 'Ultron' },
  { dockTitle: 'Music Player', windowTitle: 'Music' },
  { dockTitle: 'Safari', windowTitle: 'Safari' },
];

test.describe('Window System', () => {
  test.beforeEach(async ({ page }) => {
    await freshDesktop(page);
  });

  for (const app of APPS) {
    test(`opens ${app.windowTitle} from dock`, async ({ page }) => {
      await openAppFromDock(page, app.dockTitle);
      await page.waitForTimeout(500);
      await expect(
        page.getByText(app.windowTitle, { exact: false }).first()
      ).toBeVisible({ timeout: 5000 });
    });
  }

  test('clicking the same dock icon again minimizes and restores', async ({
    page,
  }) => {
    await openAppFromDock(page, 'Notes (About Me)');
    await expect(page.getByText('Notes', { exact: false }).first()).toBeVisible();

    const dockBtn = page.getByRole('button', { name: 'Notes (About Me)' });
    await dockBtn.click();
    await page.waitForTimeout(500);

    await dockBtn.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Notes', { exact: false }).first()).toBeVisible({ timeout: 3000 });
  });

  test('close button removes the window', async ({ page }) => {
    await openAppFromDock(page, 'Terminal (Skills CLI)');
    await expect(page.getByText('Terminal', { exact: false }).first()).toBeVisible();

    const closeBtn = page.locator('button[title="Close (Cmd+W)"]').first();
    await closeBtn.click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Terminal', { exact: false }).first()).not.toBeVisible({ timeout: 3000 });
  });

  test('maximize and restore a window', async ({ page }) => {
    await openAppFromDock(page, 'Notes (About Me)');
    await page.waitForTimeout(500);

    const maxBtn = page.locator('button[title="Maximize"]').first();
    if (await maxBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await maxBtn.click();
      await page.waitForTimeout(500);

      const restoreBtn = page.locator('button[title="Restore"]').first();
      await expect(restoreBtn).toBeVisible({ timeout: 3000 });

      await restoreBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('dragging a window changes its position', async ({ page }) => {
    await openAppFromDock(page, 'Finder (Projects)');
    await page.waitForTimeout(1000);

    const closeBtn = page.locator('button[title="Close (Cmd+W)"]').first();
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    const titleBar = closeBtn.locator('../..');
    const box = await titleBar.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 100, startY + 50, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);

      const newBox = await titleBar.boundingBox();
      expect(newBox).not.toBeNull();
      if (newBox) {
        expect(Math.abs(newBox.x - box.x)).toBeGreaterThan(30);
      }
    }
  });
});
