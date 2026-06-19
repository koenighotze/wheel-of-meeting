import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// Background: stub Alice, spin, wait for dialog
test.beforeEach(async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
});

// ---------------------------------------------------------------------------
// Scenario: DTSTART carries the Europe/Berlin timezone
// ---------------------------------------------------------------------------
test('ICS DTSTART contains TZID=Europe/Berlin', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('DTSTART;TZID=Europe/Berlin:');
});

// ---------------------------------------------------------------------------
// Scenario: DTEND carries the Europe/Berlin timezone
// ---------------------------------------------------------------------------
test('ICS DTEND contains TZID=Europe/Berlin', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('DTEND;TZID=Europe/Berlin:');
});

// ---------------------------------------------------------------------------
// Scenario: The ICS file includes a VTIMEZONE block for Europe/Berlin
// ---------------------------------------------------------------------------
test('ICS file includes a VTIMEZONE block for Europe/Berlin', async ({
  page,
}) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('BEGIN:VTIMEZONE');
  expect(content).toContain('TZID:Europe/Berlin');
});
