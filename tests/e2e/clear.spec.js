import { test, expect } from '@playwright/test';
import { stubPartners, seedFullState } from '../support/helpers.js';

async function setupWithHistory(
  page,
  { partnerIds = ['Alice', 'Bob', 'Charlie'], leadIds = [] } = {}
) {
  await stubPartners(page, { partners: partnerIds, leads: leadIds });
  await seedFullState(page, { partnerIds, leadIds });
  await page.goto('/');
}

// ---------------------------------------------------------------------------
// Scenario: Clearing history empties the "Recently Met" list
// ---------------------------------------------------------------------------
test('clearing history empties the Recently Met list', async ({ page }) => {
  await setupWithHistory(page);
  page.once('dialog', (d) => d.accept());
  await page.locator('#clear-btn').click();
  await expect(page.locator('#history-list .empty-state')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Scenario: Clearing history removes met badges from the wheel
// ---------------------------------------------------------------------------
test('clearing history removes met badges from the partner list', async ({
  page,
}) => {
  await setupWithHistory(page);
  await expect(page.locator('#partner-list .badge').first()).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.locator('#clear-btn').click();
  await expect(page.locator('#partner-list .badge')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// Scenario: Clearing history does not affect the other dataset
// ---------------------------------------------------------------------------
test('clearing Partners history does not affect Lead Developers history', async ({
  page,
}) => {
  await stubPartners(page, {
    partners: ['Alice', 'Bob', 'Charlie'],
    leads: ['Lead1', 'Lead2', 'Lead3'],
  });
  await seedFullState(page, {
    partnerIds: ['Alice', 'Bob', 'Charlie'],
    leadIds: ['Lead1', 'Lead2', 'Lead3'],
  });
  await page.goto('/');
  page.once('dialog', (d) => d.accept());
  await page.locator('#clear-btn').click();
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  await expect(page.locator('#history-list li')).toHaveCount(3);
});

// ---------------------------------------------------------------------------
// Scenario: Dismissing the confirmation leaves history unchanged
// ---------------------------------------------------------------------------
test('dismissing the confirmation leaves history unchanged', async ({
  page,
}) => {
  await setupWithHistory(page);
  page.once('dialog', (d) => d.dismiss());
  await page.locator('#clear-btn').click();
  await expect(page.locator('#history-list li')).toHaveCount(3);
});

// ---------------------------------------------------------------------------
// Scenario: Clear confirmation message names the active dataset
// ---------------------------------------------------------------------------
test('clear confirmation message names the active dataset', async ({
  page,
}) => {
  await stubPartners(page, { partners: ['Alice'], leads: ['Lead1'] });
  await page.goto('/');
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  let message = '';
  page.once('dialog', (d) => {
    message = d.message();
    d.dismiss();
  });
  await page.locator('#clear-btn').click();
  expect(message).toContain('Lead Developers');
});
