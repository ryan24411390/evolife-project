const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration for UX/UI Testing
 * Evolife Wellness Website
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false, // Run sequentially for better reporting
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'Mobile - iPhone',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      }
    },
    {
      name: 'Tablet - iPad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: 'Desktop - Laptop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 }
      }
    },
    {
      name: 'Desktop - Large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      }
    }
  ],

  webServer: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    reuseExistingServer: true,
    timeout: 120000,
  }
});
