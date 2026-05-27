import { test, expect } from '@playwright/test';

test('form submission via enter key and loading state', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const roomInput = page.locator('#room-input');
  const joinBtn = page.locator('#join-btn');
  const label = page.locator('label[for="room-input"]');

  // Verify label exists and is visually hidden
  // await expect(label).toBeVisible({ visible: false }); // Technically in DOM, but visually hidden
  const labelClass = await label.getAttribute('class');
  expect(labelClass).toContain('visually-hidden');

  // Initial state
  await expect(joinBtn).toHaveText('Join Room');
  await expect(joinBtn).toBeEnabled();

  // Type and press Enter
  await roomInput.fill('my-test-room');

  // Set up promise to wait for the button text change
  const buttonTextPromise = expect(joinBtn).toHaveText('Joining...', { timeout: 2000 });
  const buttonDisabledPromise = expect(joinBtn).toBeDisabled({ timeout: 2000 });

  await roomInput.press('Enter');

  // Check loading state
  await buttonTextPromise;
  await buttonDisabledPromise;

  // After camera access (mocked via launch args), it should revert back
  await expect(joinBtn).toHaveText('Join Room');
  await expect(joinBtn).toBeEnabled();
});
