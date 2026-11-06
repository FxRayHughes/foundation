import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// E2E：以 Wails server 模式（-tags server，纯 HTTP，无原生窗口）运行真实后端 + 前端，
// 由 Chromium 驱动。数据目录用 FOUNDATION_DATA_DIR 隔离，绝不触碰用户真实数据库。
//   1) 构建：wails3 task build:server（产物 bin/foundation-server）
//   2) 运行：cd frontend && pnpm e2e
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.E2E_PORT ?? 9346);
const DATA_DIR = process.env.E2E_DATA_DIR ?? path.join(root, '.e2e-data');

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false, // 共用一个后端 + 一个数据库，串行执行
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'zh-CN',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    ...devices['Desktop Chrome'],
    // 用本机已安装的 Chromium 系浏览器，免去 `playwright install` 下载；
    // CI 中可设 E2E_CHANNEL=chromium 并预先执行 `npx playwright install chromium`
    channel: process.env.E2E_CHANNEL ?? 'msedge',
  },
  webServer: {
    command: `rm -rf "${DATA_DIR}" && mkdir -p "${DATA_DIR}" && "${path.join(root, 'bin', 'foundation-server')}"`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    env: { WAILS_SERVER_PORT: String(PORT), FOUNDATION_DATA_DIR: DATA_DIR },
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
