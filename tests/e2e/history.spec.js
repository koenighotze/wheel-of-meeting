import { test, expect } from '@playwright/test';
import { stubPartners, seedHistory, seedFullState, waitForDialog } from '../support/helpers.js';

// ---------------------------------------------------------------------------
// Scenario: Winner appears at the top of the history list after a spin
// Setup: Alice is eligible (Bob was the only previously met partner)
// ---------------------------------------------------------------------------
test('winner appears at the top of the history list after a spin', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  await seedHistory(page, ['Bob']); // Bob met before; Alice is eligible and will be selected
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await page.locator('#dialog-close').click();
  await expect(
    page.locator('#history-list li').first().locator('.history-name')
  ).toHaveText('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: History is ordered most recent first
// ---------------------------------------------------------------------------
test('history is ordered most recent first', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  // Bob was met after Alice → Bob is most recent (first in history array)
  await seedHistory(page, ['Bob', 'Alice']);
  await page.goto('/');
  await expect(
    page.locator('#history-list li').nth(0).locator('.history-name')
  ).toHaveText('Bob');
  await expect(
    page.locator('#history-list li').nth(1).locator('.history-name')
  ).toHaveText('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: History is capped at 10 entries
// Seed 10 partners in history, spin once (11th partner wins), verify list = 10
// ---------------------------------------------------------------------------
test('history is capped at 10 entries', async ({ page }) => {
  const partners = Array.from({ length: 11 }, (_, i) => `P${i + 1}`);
  await stubPartners(page, { partners });
  // P1..P10 in history (P1 most recent). P11 is the only eligible winner.
  await seedHistory(page, partners.slice(0, 10));
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await page.locator('#dialog-close').click();
  await expect(page.locator('#history-list li')).toHaveCount(10);
});

// ---------------------------------------------------------------------------
// Scenario: Recent entry shows "just now" timestamp
// ---------------------------------------------------------------------------
test('recent entry shows "just now" timestamp', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  // Seed with current timestamp (the addInitScript runs right before load)
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
  await page.goto('/');
  const aliceEntry = page.locator('#history-list li').filter({ hasText: 'Alice' });
  await expect(aliceEntry.locator('.history-time')).toHaveText('just now');
});

// ---------------------------------------------------------------------------
// Scenario: Older entry shows "1h ago" timestamp
// ---------------------------------------------------------------------------
test('entry from 90 minutes ago shows "1h ago"', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice', 'Bob'] });
  const ts = Date.now() - 90 * 60 * 1000;
  await page.addInitScript((ts) => {
    const state = {
      version: 3,
      activeDataset: 'partners',
      datasets: {
        'partners': { history: [{ id: 'Alice', ts }] },
        'lead-developers': { history: [] },
      },
    };
    localStorage.setItem('wheel-of-meeting', JSON.stringify(state));
  }, ts);
  await page.goto('/');
  const aliceEntry = page.locator('#history-list li').filter({ hasText: 'Alice' });
  await expect(aliceEntry.locator('.history-time')).toHaveText('1h ago');
});

// ---------------------------------------------------------------------------
// Scenario: History is independent per dataset
// ---------------------------------------------------------------------------
test('history is independent per dataset', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'], leads: ['Lead1'] });
  await seedHistory(page, ['Alice'], 'partners');
  await page.goto('/');
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  await expect(page.locator('#history-list .empty-state')).toBeVisible();
});
