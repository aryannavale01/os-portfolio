import { Page, expect } from '@playwright/test';

const DISMISS_KEY = 'macos_portfolio_fs_dismissed';

/** Wait for the boot screen to finish and the desktop to be visible. */
export async function waitForDesktop(page: Page) {
  await expect(
    page.locator('h1').filter({ hasText: 'Aryan Navale' }).first()
  ).toBeVisible({ timeout: 20_000 });
  // Dismiss fullscreen prompt: set the localStorage flag directly via JS
  // so it never blocks subsequent interactions
  await page.evaluate((key) => {
    try { localStorage.setItem(key, '1'); } catch {}
  }, DISMISS_KEY);
  // Also click the Skip button if it's visible (in case prompt already rendered)
  const skipBtn = page.locator('button:has-text("Skip")').first();
  if (await skipBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await skipBtn.click({ force: true });
  }
  await page.waitForTimeout(300);
}

/** Navigate to a fresh desktop, setting the dismiss key before load. */
export async function freshDesktop(page: Page) {
  await page.goto('/');
  // Set the dismiss flag so the fullscreen prompt never appears
  await page.evaluate((key) => {
    try { localStorage.setItem(key, '1'); } catch {}
  }, DISMISS_KEY);
  await page.goto('/');
  await waitForDesktop(page);
}

/** Open an app by clicking its dock icon (matched by tooltip/aria-label). */
export async function openAppFromDock(page: Page, appName: string) {
  const btn = page.locator(`button[title*="${appName}"], button[aria-label*="${appName}"]`).first();
  await btn.click();
  // Wait for the window to appear
  await page.waitForTimeout(300);
}

/** Find the window element for a given app title. */
export function getWindowByTitle(page: Page, title: string) {
  return page.locator(`div:has(> div > div:has-text("${title}"))`).first();
}

/** Get the currently visible window count. */
export async function getOpenWindowCount(page: Page): Promise<number> {
  // Each open window has the traffic-light minimize/maximize/close buttons
  return page.locator('button[title*="Minimize"]').count();
}
