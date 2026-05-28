import { localeRegistry } from '@/i18n';
import { settingsPageZhCN } from './zh-CN';
import { settingsPageEnUS } from './en-US';
import { registerPersonalizationLocales } from '../personalization';
import { registerLanguageLocales } from '../language';
import { registerDatabaseLocales } from '../database';

let registered = false;

// 注册设置页所有文案：顶层 + 各子页面。
// 在 App.tsx 启动时调用一次，幂等。
// 顺序无关：localeRegistry.extend 是深合并，子页面命名空间互不冲突。
export const registerSettingsPageLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', settingsPageZhCN);
  localeRegistry.extend('en-US', settingsPageEnUS);
  registerPersonalizationLocales();
  registerLanguageLocales();
  registerDatabaseLocales();
  registered = true;
};
