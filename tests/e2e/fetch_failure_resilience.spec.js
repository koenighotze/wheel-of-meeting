import { test, expect } from '@playwright/test';
import { seedFullState } from '../support/helpers.js';

// ---------------------------------------------------------------------------
// Scenario: Meeting history survives a restart when the partners file is unreachable
// ---------------------------------------------------------------------------
test('history is preserved when partners JSON is unreachable', async ({
  page,
}) => {
  await seedFullState(page, {
    partnerIds: ['alice@example.com'],
    leadIds: [],
  });
  await page.route('**/data/partners.json', (r) => r.abort());
  await page.route('**/data/lead-developers.json', (r) =>
    r.fulfill({ json: [] })
  );

  await page.goto('/');

  await expect(
    page.locator('#history-list li').filter({ hasText: 'alice@example.com' })
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// Scenario: Meeting history survives a restart when the leads file is unreachable
// ---------------------------------------------------------------------------
test('history is preserved when lead-developers JSON is unreachable', async ({
  page,
}) => {
  await seedFullState(page, {
    partnerIds: [],
    leadIds: ['bob@example.com'],
    activeDataset: 'lead-developers',
  });
  await page.route('**/data/partners.json', (r) => r.fulfill({ json: [] }));
  await page.route('**/data/lead-developers.json', (r) => r.abort());

  await page.goto('/');

  // Switch to lead-developers tab to see its history
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();

  await expect(
    page.locator('#history-list li').filter({ hasText: 'bob@example.com' })
  ).toBeVisible();
});
