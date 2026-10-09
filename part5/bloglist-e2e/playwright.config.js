// @ts-check
const { defineConfig, devices } = require('@playwright/test')

// before running the tests, start:
//   the backend in test mode:   cd part4/bloglist && npm run start:test
//   the frontend:               cd part5/bloglist-frontend && npm run dev
module.exports = defineConfig({
  testDir: './tests',
  // the tests share one database, so they must run one at a time
  fullyParallel: false,
  workers: 1,
  reporter: 'html',
  use: {
    // the frontend; its dev server forwards /api/... to the backend
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
