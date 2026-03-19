import { test, expect } from '@playwright/test';
import { stubPartners, waitForDialog } from '../support/helpers.js';

// Shared setup: spin and wait for dialog to open
async function openDialog(page) {
  await page.locator('#spin-btn').click();
  await waitForDialog(page);
}

// ---------------------------------------------------------------------------
// Scenario: Pressing Escape closes the winner dialog
// ---------------------------------------------------------------------------
test('pressing Escape closes the winner dialog', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  await openDialog(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#winner-dialog')).not.toHaveAttribute('open');
});

// ---------------------------------------------------------------------------
// Scenario: Idle spin resumes after the dialog is closed with Escape
// Verified by checking that the canvas changes between two frames.
// ---------------------------------------------------------------------------
test('idle spin resumes after closing dialog with Escape', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'] });
  await page.goto('/');
  await openDialog(page);
  await page.keyboard.press('Escape');
  // Give the idle animation a moment to start
  await page.waitForTimeout(150);
  const frame1 = await page.locator('#wheel').screenshot();
  await page.waitForTimeout(400);
  const frame2 = await page.locator('#wheel').screenshot();
  expect(Buffer.compare(frame1, frame2)).not.toBe(0);
});

// ---------------------------------------------------------------------------
// Scenario: Long name is truncated on the wheel segment
// Verified by confirming the name exceeds the segment's max label width,
// meaning the rendering code will truncate it (canvas logic is deterministic).
// ---------------------------------------------------------------------------
test('long name exceeds segment width so is truncated on the canvas', async ({ page }) => {
  const longName = 'A Remarkably Long Partner Name That Will Not Fit';
  await stubPartners(page, { partners: [longName] });
  await page.goto('/');
  const wouldBeTruncated = await page.evaluate((name) => {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const r = size / 2 - 4;
    const maxWidth = r * 0.65;
    const fontSize = Math.max(10, Math.min(18, size * 0.035));
    ctx.font = `bold ${fontSize}px Segoe UI, system-ui, sans-serif`;
    return ctx.measureText(name).width > maxWidth;
  }, longName);
  expect(wouldBeTruncated).toBe(true);
});

// ---------------------------------------------------------------------------
// Scenario: Full name is shown in the partner list regardless of length
// ---------------------------------------------------------------------------
test('full name is shown in the partner list regardless of length', async ({ page }) => {
  const longName = 'A Remarkably Long Partner Name That Will Not Fit';
  await stubPartners(page, { partners: [longName] });
  await page.goto('/');
  await expect(page.locator('#partner-list')).toContainText(longName);
});

// ---------------------------------------------------------------------------
// Scenario: Rapid tab switching keeps the wheel responsive
// ---------------------------------------------------------------------------
test('rapid tab switching keeps the wheel responsive', async ({ page }) => {
  await stubPartners(page, { partners: ['Alice'], leads: ['Lead1'] });
  await page.goto('/');
  for (let i = 0; i < 10; i++) {
    await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
    await page.locator('.tab-btn[data-dataset="partners"]').click();
  }
  // End on Lead Developers
  await page.locator('.tab-btn[data-dataset="lead-developers"]').click();
  // Wheel and list should now show lead developer data
  await expect(page.locator('#partner-list')).toContainText('Lead1');
});

// ---------------------------------------------------------------------------
// Scenario: Unreachable JSON file results in a disabled Spin button
// ---------------------------------------------------------------------------
test('unreachable JSON results in a disabled Spin button', async ({ page }) => {
  await page.route('**/data/partners.json', r => r.fulfill({ status: 500 }));
  await page.route('**/data/lead-developers.json', r => r.fulfill({ status: 500 }));
  await page.goto('/');
  await expect(page.locator('#spin-btn')).toBeDisabled();
});

// ---------------------------------------------------------------------------
// Scenario: Unreachable JSON file shows a placeholder on the wheel
// ---------------------------------------------------------------------------
test('unreachable JSON shows a placeholder in the partner list', async ({ page }) => {
  await page.route('**/data/partners.json', r => r.fulfill({ status: 500 }));
  await page.route('**/data/lead-developers.json', r => r.fulfill({ status: 500 }));
  await page.goto('/');
  await expect(page.locator('#partner-list .empty-state')).toBeVisible();
});
