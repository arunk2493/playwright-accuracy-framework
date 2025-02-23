import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  reporter: [['allure-playwright']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});