import { expect, test } from '@playwright/test';
import { chooseLayout, openApp } from './helpers';

// 悬浮 Dock：拖到任何位置都必须完整留在内容区内（不进入标题栏 —— macOS 上那里是原生拖拽区 + 红绿灯），
// 且松手后手柄仍可再次拖动。
test('floating dock stays inside content area and remains draggable', async ({ page }) => {
  await openApp(page);
  await chooseLayout(page, '悬浮 Dock');

  const dock = page.locator('nav[data-dock][data-floating]');
  const handle = dock.getByRole('button', { name: /拖动以移动 Dock/ });
  const main = page.locator('main');
  await expect(dock).toBeVisible();

  const drag = async (toX: number, toY: number) => {
    const h = (await handle.boundingBox())!;
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    await page.mouse.move(toX, toY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(400); // 吸附过渡
  };

  const titleBottom = (await page.locator('[style*="--wails-draggable: drag"]').first().boundingBox())!;
  const mainBox = (await main.boundingBox())!;

  // 1) 拖到窗口左上角（红绿灯位置）
  await drag(5, 5);
  let d = (await dock.boundingBox())!;
  expect(d.y).toBeGreaterThanOrEqual(titleBottom.y + titleBottom.height + 8); // 不压标题栏
  expect(d.x).toBeLessThan(mainBox.x + mainBox.width / 2); // 吸附到左侧
  expect(d.x).toBeGreaterThanOrEqual(mainBox.x + 8);

  // 2) 手柄仍可拖动：拖到右下角，吸附右侧且不越过底边
  await drag(1275, 795);
  d = (await dock.boundingBox())!;
  expect(d.x + d.width).toBeLessThanOrEqual(mainBox.x + mainBox.width - 8);
  expect(d.x).toBeGreaterThan(mainBox.x + mainBox.width / 2);
  expect(d.y + d.height).toBeLessThanOrEqual(mainBox.y + mainBox.height - 8);

  // 3) 位置持久化：刷新后仍在右下
  await page.reload();
  await expect(page.locator('#startup-skeleton')).toHaveCount(0);
  const after = (await dock.boundingBox())!;
  expect(Math.abs(after.y - d.y)).toBeLessThan(4);
});
