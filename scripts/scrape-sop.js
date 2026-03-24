/* eslint-disable no-undef */
/**
 * Paste into DevTools console on the SOP partner search results page.
 * Navigates the SPA to each profile, extracts the email, then goes back.
 *
 * Processes profiles in batches with a longer pause between batches so the
 * server is not flooded. Failures are caught per-profile and do not abort
 * the run — failed URLs are printed at the end for manual follow-up.
 */
(async () => {
  const BATCH_SIZE = 5;          // profiles per batch
  const DELAY_BETWEEN_MS = 800;  // pause between profiles (within a batch)
  const DELAY_BATCH_MS = 3000;   // longer pause between batches
  const TIMEOUT_MS = 12000;      // max wait per profile for the email button

  // ── helpers ──────────────────────────────────────────────────────────────

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function waitFor(selector, timeoutMs = TIMEOUT_MS) {
    return new Promise((resolve) => {
      const deadline = Date.now() + timeoutMs;
      const id = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) { clearInterval(id); resolve(el); return; }
        if (Date.now() > deadline) { clearInterval(id); resolve(null); }
      }, 250);
    });
  }

  function navigateTo(url) {
    const pathname = new URL(url).pathname;
    const existing = document.querySelector(`a[href="${pathname}"], a[href="${url}"]`);
    if (existing) { existing.click(); return; }
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /** Visit one profile and return its email, or throw on failure. */
  async function scrapeProfile(url) {
    navigateTo(url);
    const btn = await waitFor('[data-testid="quick-actions-button-email"]');
    if (!btn) throw new Error('email button not found');
    const email = btn.href.replace(/^mailto:/i, '').trim();
    if (!email) throw new Error('href was empty');
    return email;
  }

  // ── Step 1: collect profile URLs ─────────────────────────────────────────

  const profileUrls = [
    ...new Set(
      [...document.querySelectorAll('a[href*="/employees/profile/"]')].map((a) => a.href)
    ),
  ];
  console.log(`Found ${profileUrls.length} profiles — batch size ${BATCH_SIZE}.\n`);

  // ── Step 2: process in batches ────────────────────────────────────────────

  const emails = [];
  const failed = [];

  for (let batchStart = 0; batchStart < profileUrls.length; batchStart += BATCH_SIZE) {
    const batch = profileUrls.slice(batchStart, batchStart + BATCH_SIZE);
    const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(profileUrls.length / BATCH_SIZE);
    console.log(`── Batch ${batchNum}/${totalBatches} ──`);

    for (let j = 0; j < batch.length; j++) {
      const url = batch[j];
      const idx = batchStart + j + 1;

      try {
        const email = await scrapeProfile(url);
        emails.push(email);
        console.log(`  [${idx}/${profileUrls.length}] ✅ ${email}`);
      } catch (err) {
        failed.push(url);
        console.warn(`  [${idx}/${profileUrls.length}] ❌ ${url} — ${err.message}`);
      }

      history.back();
      await waitFor('a[href*="/employees/profile/"]');
      await sleep(DELAY_BETWEEN_MS);
    }

    if (batchStart + BATCH_SIZE < profileUrls.length) {
      console.log(`  ⏸  Batch ${batchNum} done — pausing ${DELAY_BATCH_MS / 1000}s…`);
      await sleep(DELAY_BATCH_MS);
    }
  }

  // ── Step 3: output ────────────────────────────────────────────────────────

  if (failed.length) {
    console.warn(`\n⚠️  ${failed.length} profile(s) failed:\n${failed.join('\n')}`);
  }

  console.log(`\n✅ Collected ${emails.length} email(s). Paste into data/partners.json:\n`);
  console.log(JSON.stringify(emails, null, 2));
})();
