import { defineConfig } from '@playwright/test';

// Pin the timezone so Node (test code) and Chromium (app) agree on local time,
// regardless of the host's TZ setting.
const TIMEZONE = 'Europe/Berlin';
process.env.TZ = TIMEZONE;

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:8081', timezoneId: TIMEZONE },
  webServer: {
    command: 'python3 -m http.server 8081 --directory src',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
  },
});
