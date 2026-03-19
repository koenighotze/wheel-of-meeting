/**
 * Shared helpers for wheel-of-meeting Playwright tests.
 */

/**
 * Stub the JSON fetch calls for both datasets.
 * @param {import('@playwright/test').Page} page
 * @param {{ partners?: string[], leads?: string[] }} data
 */
export async function stubPartners(page, { partners = [], leads = [] } = {}) {
  await page.route('**/data/partners.json', (r) =>
    r.fulfill({ json: partners })
  );
  await page.route('**/data/lead-developers.json', (r) =>
    r.fulfill({ json: leads })
  );
}

/**
 * Pre-seed localStorage with a full state object before the page boots.
 * Must be called before page.goto().
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ partnerIds?: string[], leadIds?: string[], activeDataset?: string }} opts
 */
export async function seedFullState(
  page,
  { partnerIds = [], leadIds = [], activeDataset = 'partners' } = {}
) {
  await page.addInitScript(
    ({ partnerIds, leadIds, activeDataset }) => {
      const state = {
        version: 3,
        activeDataset,
        datasets: {
          partners: {
            history: partnerIds.map((id) => ({ id, ts: Date.now() })),
          },
          'lead-developers': {
            history: leadIds.map((id) => ({ id, ts: Date.now() })),
          },
        },
      };
      localStorage.setItem('wheel-of-meeting', JSON.stringify(state));
    },
    { partnerIds, leadIds, activeDataset }
  );
}

/**
 * Pre-seed localStorage history for one dataset.
 * Convenience wrapper around seedFullState.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string[]} ids - ordered list of partner ids (most recent first)
 * @param {'partners'|'lead-developers'} dataset
 */
export async function seedHistory(page, ids, dataset = 'partners') {
  await seedFullState(page, {
    partnerIds: dataset === 'partners' ? ids : [],
    leadIds: dataset === 'lead-developers' ? ids : [],
    activeDataset: dataset,
  });
}

/**
 * Wait for the winner dialog to appear (open attribute set).
 * @param {import('@playwright/test').Page} page
 */
export async function waitForDialog(page) {
  await page.locator('#winner-dialog[open]').waitFor({ timeout: 8000 });
}
