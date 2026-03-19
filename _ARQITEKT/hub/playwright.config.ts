import { defineConfig, devices } from '@playwright/test';

const API_PORT = process.env.E2E_API_PORT || '3335';
const VITE_PORT = process.env.E2E_VITE_PORT || '5175';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 60000,
  use: {
    baseURL: `http://localhost:${VITE_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run dev --prefix ../server',
      port: parseInt(API_PORT),
      reuseExistingServer: !process.env.CI,
      env: { ...process.env, PORT: API_PORT },
    },
    {
      command: `npx vite --port ${VITE_PORT}`,
      port: parseInt(VITE_PORT),
      reuseExistingServer: !process.env.CI,
      env: { ...process.env, VITE_API_PORT: API_PORT },
    },
  ],
});
