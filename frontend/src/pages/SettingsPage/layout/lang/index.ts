import { localeRegistry } from '@/i18n';
import { layoutZhCN } from './zh-CN';
import { layoutEnUS } from './en-US';

let registered = false;

// 布局子页面文案（settings.layout.*），含 layouts/presets.ts 引用的 presets.<id>.* —— 首页「当前布局」卡片同样依赖。
export const registerLayoutLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', layoutZhCN);
  localeRegistry.extend('en-US', layoutEnUS);
  registered = true;
};
