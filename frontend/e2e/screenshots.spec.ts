import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

// README 截图：真实后端（server 模式）+ 隔离数据库。
// 布局 / 主题直接写入 E2E 数据库后刷新，保证每张图确定可复现。
// 标题栏按 Windows 渲染（自绘最小化 / 最大化 / 关闭）：浏览器里没有原生 macOS 红绿灯。
// 产物：docs/screenshots/*.png  —— 运行：cd frontend && pnpm e2e:screenshots
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(root, 'docs', 'screenshots');
const DB = path.join(process.env.E2E_DATA_DIR ?? path.join(root, '.e2e-data'), 'foundation.db');
mkdirSync(OUT, { recursive: true });

const sql = (q: string) => execFileSync('sqlite3', [DB, q]);
const setPref = (key: string, value: unknown) =>
  sql(
    `insert into preferences(key,value,updated_at) values('${key}','${JSON.stringify(value).replace(/'/g, "''")}',0) ` +
      `on conflict(key) do update set value=excluded.value;`,
  );
const setTheme = (choice: string) => sql(`update app_settings set theme_choice='${choice}' where id=1;`);

test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'Win32' });
  });
});

const ready = async (page: Page) => {
  await page.goto('/');
  await expect(page.locator('#startup-skeleton')).toHaveCount(0, { timeout: 10_000 });
  await page.mouse.move(1, 790); // 移开鼠标，避免 hover 态
  await page.waitForTimeout(500);
};
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
const openSettings = async (page: Page, section: string) => {
  await page.getByRole('button', { name: '设置' }).first().click();
  await page.getByRole('button', { name: new RegExp(`^${section}`) }).first().click();
  await page.waitForTimeout(400);
};

const LAYOUTS = ['classic', 'sidebar', 'topnav', 'titlebar', 'right', 'dock', 'floating', 'inset', 'focus'];

test('layouts', async ({ page }) => {
  setTheme('foundation-light');
  for (const id of LAYOUTS) {
    setPref('layout', id);
    await ready(page);
    await shot(page, `layout-${id}`);
  }
  setPref('layout', 'classic');
});

test('focus drawer open', async ({ page }) => {
  setTheme('foundation-light');
  setPref('layout', 'focus');
  await ready(page);
  await page.getByRole('button', { name: /打开导航菜单|菜单/ }).first().click();
  await page.waitForTimeout(500);
  await shot(page, 'layout-focus-drawer');
  setPref('layout', 'classic');
});

test('pages', async ({ page }) => {
  setTheme('foundation-light');
  setPref('layout', 'sidebar');
  await ready(page);
  await page.getByRole('button', { name: /X-Pro/ }).first().click();
  await page.waitForTimeout(1200);
  await shot(page, 'page-xpro-grid');
  await page
    .locator('main')
    .getByText('Charts Pro')
    .evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(800);
  await shot(page, 'page-xpro-charts');

  await openSettings(page, '布局');
  await shot(page, 'page-settings-layout');
  await openSettings(page, '个性化');
  await shot(page, 'page-settings-personalization');
  await openSettings(page, '数据存储');
  await page.waitForTimeout(800);
  await shot(page, 'page-settings-database');
  setPref('layout', 'classic');
});

test('themes', async ({ page }) => {
  for (const [theme, layout] of [
    ['foundation-dark', 'sidebar'],
    ['foundation-obsidian', 'inset'],
  ] as const) {
    setTheme(theme);
    setPref('layout', layout);
    await ready(page);
    await shot(page, `theme-${theme.replace('foundation-', '')}`);
  }
  setTheme('system');
  setPref('layout', 'classic');
});

test('tray panel and child window', async ({ page }) => {
  setTheme('foundation-light');
  await page.setViewportSize({ width: 320, height: 420 });
  await page.goto('/systray.html');
  await page.waitForTimeout(1200);
  await shot(page, 'tray-panel');
  await page.setViewportSize({ width: 420, height: 220 });
  await page.goto('/child.html?id=demo&type=confirm&title=%E7%A1%AE%E8%AE%A4&message=%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%89%A7%E8%A1%8C%E6%AD%A4%E6%93%8D%E4%BD%9C%E5%90%97%EF%BC%9F');
  await page.waitForTimeout(1000);
  await shot(page, 'child-confirm');
});
