import { test, expect } from '@playwright/test';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// For persistence tests we spin the wheel to create real localStorage state,
// then reload — so we do NOT use seedHistory/addInitScript (which would
// re-seed on every reload and mask whether localStorage truly persisted).

// ---------------------------------------------------------------------------
// Scenario: Meeting history is restored after refresh
// ---------------------------------------------------------------------------
test('meeting history is restored after page refresh', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  // Spin so Alice is recorded in history
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await page.locator('#dialog-close').click();
  // Reload and verify Alice is still in the history list
  await page.reload();
  await expect(page.locator('#history-list li').filter({ hasText: 'Alice' })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Scenario: Met segment graying is restored after refresh
// ---------------------------------------------------------------------------
test('met segment graying (history data) is restored after page refresh', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await page.locator('#dialog-close').click();
  await page.reload();
  await page.waitForFunction(() => !!window.__wheel);
  const history = await page.evaluate(() => window.__wheel.getHistory());
  expect(history.some(h => h.id === 'Alice')).toBe(true);
});

// ---------------------------------------------------------------------------
// Scenario: Active dataset tab is restored after refresh
// Simulate via localStorage (not a spin) since tab state is persisted directly.
// ---------------------------------------------------------------------------
test('active dataset tab is restored after page refresh', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'], leads: ['Lead1'] });
  // Navigate first to get a page context, then manually set localStorage
  // with lead-developers as the active dataset, then reload.
  await page.goto('/');
  await page.evaluate(() => {
    const state = {
      version: 3,
      activeDataset: 'lead-developers',
      datasets: {
        'partners': { history: [] },
        'lead-developers': { history: [] },
      },
    };
    localStorage.setItem('wheel-of-meeting', JSON.stringify(state));
  });
  await page.reload();
  await expect(
    page.locator('.tab-btn[data-dataset="lead-developers"]')
  ).toHaveClass(/active/);
});

// ---------------------------------------------------------------------------
// Scenario: Stale history entry is removed when a name is deleted from JSON
// ---------------------------------------------------------------------------
test('stale history entry is pruned when name is removed from JSON', async ({ page }) => {
  // Seed Alice in history via localStorage before load
  await page.addInitScript(() => {
    const state = {
      version: 3,
      activeDataset: 'partners',
      datasets: {
        'partners': { history: [{ id: 'Alice', ts: Date.now() }] },
        'lead-developers': { history: [] },
      },
    };
    localStorage.setItem('wheel-of-meeting', JSON.stringify(state));
  });
  // Stub partners.json WITHOUT Alice — she has been removed
  await stubPartners(page, { partners: ['Bob'] });
  await page.goto('/');
  // Alice should not appear in the history list (pruned on load)
  await expect(
    page.locator('#history-list li').filter({ hasText: 'Alice' })
  ).toHaveCount(0);
});
