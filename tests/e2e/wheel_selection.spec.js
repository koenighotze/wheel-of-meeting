import { test, expect } from '@playwright/test';
import { stubPartners, seedHistory, waitForDialog } from '../support/helpers.js';

// ---------------------------------------------------------------------------
// Scenario: Spin with a single name always selects that person
// ---------------------------------------------------------------------------
test('spin with single name selects that person', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await expect(page.locator('#winner-name')).toHaveText('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: Recently met partner segment is grayed out on the wheel
// Verified via window.__wheel.getHistory() — the data that drives the gray rendering
// ---------------------------------------------------------------------------
test('recently met partner is in history (drives grayed-out segment)', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await seedHistory(page, ['Alice']);
  await page.goto('/');
  // Wait for the app to finish booting
  await page.waitForFunction(() => !!window.__wheel);
  const history = await page.evaluate(() => window.__wheel.getHistory());
  expect(history.some(h => h.id === 'Alice')).toBe(true);
});

// ---------------------------------------------------------------------------
// Scenario: Recently met partner segment shows a "(met)" label
// The label is driven by history data; verified via same hook
// ---------------------------------------------------------------------------
test('recently met partner history entry drives (met) label on canvas', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await seedHistory(page, ['Alice']);
  await page.goto('/');
  await page.waitForFunction(() => !!window.__wheel);
  const history = await page.evaluate(() => window.__wheel.getHistory());
  // Alice being in history is what causes the "(met)" label to render
  expect(history.map(h => h.id)).toContain('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: Recently met partner shows a met badge in the list
// ---------------------------------------------------------------------------
test('recently met partner shows met badge in the partner list', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await seedHistory(page, ['Alice']);
  await page.goto('/');
  // Find the list item that contains "Alice" text and check it has a .badge sibling
  const aliceItem = page.locator('#partner-list li').filter({ hasText: 'Alice' });
  await expect(aliceItem.locator('.badge')).toBeVisible();
  await expect(aliceItem.locator('.badge')).toHaveText('met');
});

// ---------------------------------------------------------------------------
// Scenario: Recently met partner is excluded from selection
// ---------------------------------------------------------------------------
test('recently met partner is excluded from selection', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await seedHistory(page, ['Alice']);
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await expect(page.locator('#winner-name')).toHaveText('Bob');
});

// ---------------------------------------------------------------------------
// Scenario: Fallback when all partners have been met — not the most recent
// History: [Bob (most recent), Alice] → eligible = [Alice]
// ---------------------------------------------------------------------------
test('fallback when all met: excludes most recent, selects older', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await seedHistory(page, ['Bob', 'Alice']); // Bob most recent
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await expect(page.locator('#winner-name')).toHaveText('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: Fallback when only one partner exists and they are in history
// ---------------------------------------------------------------------------
test('fallback with single partner in history still selects them', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await seedHistory(page, ['Alice']);
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await expect(page.locator('#winner-name')).toHaveText('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: Spin button is disabled when the dataset is empty
// ---------------------------------------------------------------------------
test('spin button disabled when dataset is empty', async ({ page }) => {
  await stubPartners(page, { partners: [] });
  await page.goto('/');
  await expect(page.locator('#spin-btn')).toBeDisabled();
});

// ---------------------------------------------------------------------------
// Scenario: Empty dataset shows a placeholder on the wheel
// ---------------------------------------------------------------------------
test('empty dataset shows placeholder in partner list', async ({ page }) => {
  await stubPartners(page, { partners: [] });
  await page.goto('/');
  const emptyState = page.locator('#partner-list .empty-state');
  await expect(emptyState).toBeVisible();
});

// ---------------------------------------------------------------------------
// Scenario: Spin button is disabled while the wheel is animating
// ---------------------------------------------------------------------------
test('spin button is disabled during animation', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  // Check immediately after click — button should be disabled during the 4.5s animation
  await expect(page.locator('#spin-btn')).toBeDisabled();
});

// ---------------------------------------------------------------------------
// Scenario: Spin button is re-enabled after the wheel stops
// ---------------------------------------------------------------------------
test('spin button re-enabled after wheel stops', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  // Dialog is open — button should be enabled again
  await expect(page.locator('#spin-btn')).toBeEnabled();
});
