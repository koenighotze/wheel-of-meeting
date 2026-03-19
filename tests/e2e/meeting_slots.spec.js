import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// Convert an ISO date string to the ICS date format used by app.js (local time)
function isoToIcsDate(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

// Background: stub Alice, spin, wait for dialog
test.beforeEach(async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
});

// ---------------------------------------------------------------------------
// Scenario: Three meeting slots are proposed
// ---------------------------------------------------------------------------
test('exactly 3 meeting slot options are displayed', async ({ page }) => {
  await expect(page.locator('.slot-btn')).toHaveCount(3);
});

// ---------------------------------------------------------------------------
// Scenario: Each proposed slot starts no earlier than 11:00
// ---------------------------------------------------------------------------
test('each proposed slot starts no earlier than 11:00', async ({ page }) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  for (const slot of slots) {
    const start = new Date(slot.start);
    expect(start.getHours()).toBeGreaterThanOrEqual(11);
  }
});

// ---------------------------------------------------------------------------
// Scenario: Each proposed slot ends no later than 14:00
// ---------------------------------------------------------------------------
test('each proposed slot ends no later than 14:00', async ({ page }) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  for (const slot of slots) {
    const end = new Date(slot.end);
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    expect(endMinutes).toBeLessThanOrEqual(14 * 60);
  }
});

// ---------------------------------------------------------------------------
// Scenario: All proposed slots fall on weekdays
// ---------------------------------------------------------------------------
test('none of the proposed slots fall on a weekend', async ({ page }) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  for (const slot of slots) {
    const dow = new Date(slot.start).getDay();
    expect(dow).not.toBe(0); // Sunday
    expect(dow).not.toBe(6); // Saturday
  }
});

// ---------------------------------------------------------------------------
// Scenario: All proposed slots fall within the next 14 days
// ---------------------------------------------------------------------------
test('each proposed slot is within the next 14 calendar days', async ({
  page,
}) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  const now = Date.now();
  const msIn14Days = 14 * 24 * 60 * 60 * 1000;
  for (const slot of slots) {
    const start = new Date(slot.start).getTime();
    expect(start).toBeGreaterThan(now);
    expect(start).toBeLessThanOrEqual(now + msIn14Days + 24 * 60 * 60 * 1000);
  }
});

// ---------------------------------------------------------------------------
// Scenario: All proposed slots are on different days
// ---------------------------------------------------------------------------
test('no two proposed slots share the same calendar date', async ({ page }) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  const days = slots.map((s) => {
    const d = new Date(s.start);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  });
  expect(new Set(days).size).toBe(3);
});

// ---------------------------------------------------------------------------
// Scenario: Selecting a slot downloads an ICS file
// ---------------------------------------------------------------------------
test('clicking a slot downloads an ICS file named 1on1-Alice.ics', async ({
  page,
}) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  expect(download.suggestedFilename()).toBe('1on1-Alice.ics');
});

// ---------------------------------------------------------------------------
// Scenario: Selecting a slot closes the dialog
// ---------------------------------------------------------------------------
test('clicking a slot closes the dialog', async ({ page }) => {
  await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  await expect(page.locator('#winner-dialog')).not.toHaveAttribute('open');
});

// ---------------------------------------------------------------------------
// Scenario: Downloaded ICS contains the correct summary
// ---------------------------------------------------------------------------
test('downloaded ICS contains the correct SUMMARY line', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  expect(content).toContain('SUMMARY:1:1 with Alice');
});

// ---------------------------------------------------------------------------
// Scenario: Downloaded ICS contains the correct start time
// ---------------------------------------------------------------------------
test('downloaded ICS DTSTART matches the displayed start time of the first slot', async ({
  page,
}) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  const dtstart = content.match(/DTSTART:(\d{8}T\d{6})/)[1];
  expect(dtstart).toBe(isoToIcsDate(slots[0].start));
});

// ---------------------------------------------------------------------------
// Scenario: Downloaded ICS contains the correct end time
// ---------------------------------------------------------------------------
test('downloaded ICS DTEND is 30 minutes after the displayed start time', async ({
  page,
}) => {
  const slots = await page.evaluate(() => window.__wheel.getLastSlots());
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.slot-btn').first().click(),
  ]);
  const content = await readFile(await download.path(), 'utf8');
  const dtend = content.match(/DTEND:(\d{8}T\d{6})/)[1];
  expect(dtend).toBe(isoToIcsDate(slots[0].end));
});

// ---------------------------------------------------------------------------
// Scenario: Clicking Skip closes the dialog
// ---------------------------------------------------------------------------
test('clicking Skip closes the dialog', async ({ page }) => {
  await page.locator('#dialog-close').click();
  await expect(page.locator('#winner-dialog')).not.toHaveAttribute('open');
});

// ---------------------------------------------------------------------------
// Scenario: Clicking Skip does not download a file
// ---------------------------------------------------------------------------
test('clicking Skip does not download a file', async ({ page }) => {
  let downloaded = false;
  page.on('download', () => {
    downloaded = true;
  });
  await page.locator('#dialog-close').click();
  await expect(page.locator('#winner-dialog')).not.toHaveAttribute('open');
  expect(downloaded).toBe(false);
});

// ---------------------------------------------------------------------------
// Scenario: Clicking Skip still records the meeting in history
// recordMeeting() is called before the dialog opens, so history already has
// Alice when the dialog is visible.
// ---------------------------------------------------------------------------
test('clicking Skip still records the meeting in the history list', async ({
  page,
}) => {
  await page.locator('#dialog-close').click();
  await expect(
    page.locator('#history-list li').filter({ hasText: 'Alice' })
  ).toBeVisible();
});
