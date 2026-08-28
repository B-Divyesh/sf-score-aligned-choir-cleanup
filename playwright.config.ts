import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: { trace: "retain-on-failure" },
  webServer: [
    { command: "npm run dev -- --host 127.0.0.1", port: 1420, reuseExistingServer: true },
    { command: "npm run build:site && npm run preview:site -- --host 127.0.0.1 --port 4173", port: 4173, reuseExistingServer: true },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
