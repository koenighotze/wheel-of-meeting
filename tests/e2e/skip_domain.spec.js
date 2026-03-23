import { test, expect } from '@playwright/test';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// ---------------------------------------------------------------------------
// Scenario: Finanteq partner is not shown in the partner list
// ---------------------------------------------------------------------------
test('finanteq partner is not shown in the partner list', async ({ page }) => {
  await stubPartners(page, {
    partners: ['alice@finanteq.com', 'bob@example.com'],
  });
  await page.goto('/');
  const list = page.locator('#partner-list');
  await expect(list).not.toContainText('Alice');
  await expect(list).toContainText('Bob');
});

// ---------------------------------------------------------------------------
// Scenario: Finanteq lead developer is not shown in the lead list
// ---------------------------------------------------------------------------
test('finanteq lead is not shown in the lead developer list', async ({
  page,
}) => {
  await stubPartners(page, {
    leads: ['grace@finanteq.com', 'henry@example.com'],
  });
  await page.goto('/');
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  const list = page.locator('#partner-list');
  await expect(list).not.toContainText('Grace');
  await expect(list).toContainText('Henry');
});

// ---------------------------------------------------------------------------
// Scenario: Finanteq partner is never selected as winner
// ---------------------------------------------------------------------------
test('finanteq partner is never selected as winner', async ({ page }) => {
  await stubPartners(page, {
    partners: ['alice@finanteq.com', 'bob@example.com'],
  });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await expect(page.locator('#winner-name')).toHaveText('Bob');
});

// ---------------------------------------------------------------------------
// Scenario: Spin button disabled when only Finanteq partners are present
// ---------------------------------------------------------------------------
test('spin button is disabled when only finanteq partners are present', async ({
  page,
}) => {
  await stubPartners(page, { partners: ['alice@finanteq.com'] });
  await page.goto('/');
  await expect(page.locator('#spin-btn')).toBeDisabled();
});
