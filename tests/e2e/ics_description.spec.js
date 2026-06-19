import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// Background: stub Markus Dobel, spin, wait for dialog
test.beforeEach(async ({ page }) => {
  await stubPartners(page, { partners: ['markus.dobel@senacor.com'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
});

function extractDescription(content) {
  // DESCRIPTION may be folded across lines (CRLF + space continuation)
  const unfolded = content.replace(/\r\n[ \t]/g, '');
  const match = unfolded.match(/^DESCRIPTION:(.*)$/m);
  return match ? match[1].replace(/\\n/g, '\n') : '';
}

// ---------------------------------------------------------------------------
// Scenario: Description opens with the partner's first name
// ---------------------------------------------------------------------------
test('ICS DESCRIPTION starts with the partner first name greeting', async ({
  page,
}) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  const description = extractDescription(content);
  expect(description).toMatch(/^Hallo Markus/);
});

// ---------------------------------------------------------------------------
// Scenario: Description mentions Wheel-of-Meeting
// ---------------------------------------------------------------------------
test('ICS DESCRIPTION mentions Wheel-of-Meeting', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  const description = extractDescription(content);
  expect(description).toContain('Wheel-of-Meeting');
});

// ---------------------------------------------------------------------------
// Scenario: Description is signed by David Schmitz
// ---------------------------------------------------------------------------
test('ICS DESCRIPTION ends with David Schmitz', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  const description = extractDescription(content);
  expect(description.trimEnd()).toMatch(/David Schmitz$/);
});
