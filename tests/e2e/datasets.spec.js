import { test, expect } from '@playwright/test';
import { stubPartners } from '../support/helpers.js';

// ---------------------------------------------------------------------------
// Scenario: Switching tabs updates the section heading
// ---------------------------------------------------------------------------
test('switching to Lead Developers tab updates section heading', async ({
  page,
}) => {
  await stubPartners(page, { partners: ['Alice'], leads: ['Lead1'] });
  await page.goto('/');
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  await expect(page.locator('#section-heading')).toHaveText('Lead Developers');
});

// ---------------------------------------------------------------------------
// Scenario: Switching tabs updates the wheel content
// ---------------------------------------------------------------------------
test('switching to Lead Developers tab shows lead developer names in list', async ({
  page,
}) => {
  await stubPartners(page, { partners: ['Alice'], leads: ['Lead1'] });
  await page.goto('/');
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  await expect(page.locator('#partner-list')).toContainText('Lead1');
});
