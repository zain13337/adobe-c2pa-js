import { PlaywrightTestConfig } from '@playwright/test';
const baseURL = process.env.BASE_URL;
const port = 8081;

const config: PlaywrightTestConfig = {
  testDir: 'tests',
  use: {
    baseURL,
    headless: true,
    ignoreHTTPSErrors: true,
  },
  webServer: baseURL
    ? undefined
    : {
        command: 'npm run test:server',
        port,
        timeout: 120 * 1000,
        reuseExistingServer: false,
        env: {
          PORT: port.toString(),
        },
      },
};
export default config;
