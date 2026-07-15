import { defineConfig } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? '4173')

export default defineConfig({
  testDir: './src/ui-audit',
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true },
  webServer: { command: `npm run dev -- --host 127.0.0.1 --port ${port}`, port, reuseExistingServer: false },
})
