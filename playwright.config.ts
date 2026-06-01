import { defineConfig, devices } from "@playwright/test";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 7"] },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 15 Pro"] },
    // },
  ],
});
