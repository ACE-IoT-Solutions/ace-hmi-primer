import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:5175" },
  projects: [
    {
      name: "local",
      testMatch: [
        "app.spec.ts",
        "gap-review.spec.ts",
        "coil-diagnostics.spec.ts",
        "building-hierarchy.spec.ts",
      ],
    },
    {
      name: "receiver",
      testMatch: "quiz-delivery.spec.ts",
      use: { baseURL: "http://127.0.0.1:5176" },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --port 5175 --strictPort",
      url: "http://127.0.0.1:5175",
      env: { VITE_QUIZ_RESULTS_ENDPOINT: "" },
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5176 --strictPort",
      url: "http://127.0.0.1:5176",
      env: {
        VITE_QUIZ_RESULTS_ENDPOINT:
          "https://script.google.com/macros/s/HMI_TEST_ONLY/exec",
      },
      reuseExistingServer: false,
    },
  ],
});
