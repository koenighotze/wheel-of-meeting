import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// ---------------------------------------------------------------------------
// Scenario: Partner list shows display name, not the email address
// ---------------------------------------------------------------------------
test('partner list shows display name not email address', async ({ page }) => {
  await stubPartners(page, { partners: ['markus.dobel@senacor.com'] });
  await page.goto('/');
  const list = page.locator('#partner-list');
  await expect(list).toContainText('Markus Dobel');
  await expect(list).not.toContainText('markus.dobel@senacor.com');
});

// ---------------------------------------------------------------------------
// Scenario: Winner dialog shows display name, not the email address
// ---------------------------------------------------------------------------
test('winner dialog shows display name not email address', async ({ page }) => {
  await stubPartners(page, { partners: ['markus.dobel@senacor.com'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
  await expect(page.locator('#winner-name')).toHaveText('Markus Dobel');
});

// ---------------------------------------------------------------------------
// Scenario: Single-word email local part is capitalised
// ---------------------------------------------------------------------------
test('single-word local part is capitalised as display name', async ({
  page,
}) => {
  await stubPartners(page, { partners: ['alice@example.com'] });
  await page.goto('/');
  await expect(page.locator('#partner-list')).toContainText('Alice');
});

// ---------------------------------------------------------------------------
// Scenario: ICS attendee line still uses the full email address
// ---------------------------------------------------------------------------
test('ICS attendee uses email and summary uses display name', async ({
  page,
}) => {
  await stubPartners(page, { partners: ['markus.dobel@senacor.com'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('mailto:markus.dobel@senacor.com');
  expect(content).toContain('1:1 with Markus Dobel');
});
