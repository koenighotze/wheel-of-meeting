import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// Background: stub an email-address partner, spin, open dialog
test.beforeEach(async ({ page }) => {
  await stubPartners(page, { partners: ['alice@example.com'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
});

// ---------------------------------------------------------------------------
// Scenario: Downloaded ICS includes the winner as an ATTENDEE
// ---------------------------------------------------------------------------
test('downloaded ICS includes winner as ATTENDEE with mailto link', async ({
  page,
}) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('ATTENDEE');
  expect(content).toContain('mailto:alice@example.com');
});

// ---------------------------------------------------------------------------
// Scenario: Downloaded ICS uses REQUEST method when attendee is present
// ---------------------------------------------------------------------------
test('downloaded ICS uses METHOD:REQUEST when an attendee is present', async ({
  page,
}) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('METHOD:REQUEST');
});
