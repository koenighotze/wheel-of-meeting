import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:8081/src' },
  webServer: {
    command: 'python3 -m http.server 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
  },
});
