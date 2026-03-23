import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Scenario: Production data files use email addresses as partner IDs
// Verify the raw data files contain emails (source of truth for IDs).
// The UI shows display names derived from those emails, not the raw emails.
// ---------------------------------------------------------------------------
test('production partners data file uses email addresses as IDs', async ({
  page,
}) => {
  const resp = await page.request.get('/data/partners.json');
  const partners = await resp.json();
  for (const entry of partners) {
    expect(entry).toMatch(/@/);
  }
});

test('production lead-developers data file uses email addresses as IDs', async ({
  page,
}) => {
  const resp = await page.request.get('/data/lead-developers.json');
  const leads = await resp.json();
  for (const entry of leads) {
    expect(entry).toMatch(/@/);
  }
});
