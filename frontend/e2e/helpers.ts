import { expect, type Page } from '@playwright/test';

// 等应用就绪：启动骨架淡出（偏好 / 布局已从后端读回）
export const openApp = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator('#startup-skeleton')).toHaveCount(0, { timeout: 10_000 });
};

// 经设置页切换布局预设（与用户操作一致；写入真实后端 preferences）
export const chooseLayout = async (page: Page, label: string): Promise<void> => {
  await page.getByRole('button', { name: '设置' }).first().click();
  await page.getByText('布局', { exact: true }).first().click();
  await page.getByRole('radio', { name: new RegExp(label) }).click();
};
