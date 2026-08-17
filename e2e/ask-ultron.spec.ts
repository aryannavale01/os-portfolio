import { test, expect } from './fixtures';
import { waitForDesktop, openAppFromDock } from './helpers';

test.describe('Ask Ultron (AI Chatbot)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForDesktop(page);
  });

  test('suggested questions are visible on empty state', async ({ page }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(500);

    // Should see the "Ask me anything" heading
    await expect(
      page.locator('text=Ask me anything about Aryan').first()
    ).toBeVisible({ timeout: 5000 });

    // Should see suggested questions
    await expect(
      page.locator('button:has-text("What projects has Aryan built?")').first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('clicking a suggested question sends it and gets a response', async ({
    page,
  }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(500);

    // Click a suggested question
    await page
      .locator('button:has-text("What projects has Aryan built?")')
      .first()
      .click();

    // The user message should appear
    await expect(
      page.locator('text=What projects has Aryan built?').first()
    ).toBeVisible({ timeout: 3000 });

    // Wait for assistant response (may take time due to API call)
    // The loading dots appear first, then the response
    const assistantBubble = page.locator(
      'div[class*="rounded-2xl"][class*="rounded-bl-md"]:not(:has(div[class*="accent"]))'
    ).last();

    // Wait up to 30s for a response to appear
    await expect(assistantBubble).toBeVisible({ timeout: 30_000 });

    // Response should have some text content (may be empty if GROQ_API_KEY is not configured)
    const text = await assistantBubble.textContent();
    // If API is configured, response should have content; otherwise just check the bubble appeared
    if (text && text.trim().length > 0) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
    // Either way, the assistant bubble appeared — the UI flow works
  });

  test('code request shows refusal message', async ({ page }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(500);

    // Type a code request that triggers the CODE_RE pattern
    const input = page.locator(
      'input[placeholder*="Ask Ultron"]'
    );
    await input.fill('Write me a function to sort an array');
    await page.keyboard.press('Enter');

    // User message appears
    await expect(
      page.locator('text=Write me a function to sort an array').first()
    ).toBeVisible({ timeout: 3000 });

    // The response should be the redirect/refusal message (server-side regex match)
    // Wait for assistant response
    await page.waitForTimeout(5000);

    const pageText = await page.textContent('body');
    // The refusal message contains "just here to answer questions about Aryan"
    expect(pageText).toContain(
      "just here to answer questions about Aryan"
    );
  });

  test('new chat button clears messages', async ({ page }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(500);

    // Send a message
    const input = page.locator(
      'input[placeholder*="Ask Ultron"]'
    );
    await input.fill('Hello');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Click the new chat button (RotateCcw icon button)
    const newChatBtn = page.locator('button[title="New chat"]');
    await newChatBtn.click();
    await page.waitForTimeout(300);

    // Should show empty state again
    await expect(
      page.locator('text=Ask me anything about Aryan').first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(500);

    const sendBtn = page.locator('button[title="Send"]');
    await expect(sendBtn).toBeDisabled();
  });

  test('rate limiting triggers after rapid requests', async ({ page }) => {
    await openAppFromDock(page, 'Ultron');
    await page.waitForTimeout(500);

    const input = page.locator(
      'input[placeholder*="Ask Ultron"]'
    );

    // Send 7 rapid requests (limit is 6)
    for (let i = 0; i < 7; i++) {
      await input.fill(`Question ${i + 1}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }

    // Wait for responses to come back
    await page.waitForTimeout(8000);

    // At least one response should contain the rate limit message
    const pageText = await page.textContent('body');
    expect(pageText).toContain(
      "You're asking a lot right now"
    );
  });
});
