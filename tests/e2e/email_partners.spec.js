import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Scenario: Production data files use email addresses as partner IDs
// Verify the raw data files contain emails (source of truth for IDs).
// The UI shows display names derived from those emails, not the raw emails.
// ---------------------------------------------------------------------------
test('production partners data file uses email addresses as IDs', () => {
  const partners = JSON.parse(
    readFileSync(join(process.cwd(), 'data/partners.json'), 'utf8')
  );
  for (const entry of partners) {
    expect(entry).toMatch(/@/);
  }
});

test('production lead-developers data file uses email addresses as IDs', () => {
  const leads = JSON.parse(
    readFileSync(join(process.cwd(), 'data/lead-developers.json'), 'utf8')
  );
  for (const entry of leads) {
    expect(entry).toMatch(/@/);
  }
});
