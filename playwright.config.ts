import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "4173";
const baseURL = `http://127.0.0.1:${port}/slotledger-qa-automation/`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: `test-results/${port}`,
  reporter: [
  ["list"],
  [
    "html",
    {
      open: "never",
      outputFolder: `playwright-report/${port}`,
    },
  ],
],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI && port === "4173",
  },
});
