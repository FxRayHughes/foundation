import { localeRegistry } from '@/i18n';
import { personalizationZhCN } from './zh-CN';
import { personalizationEnUS } from './en-US';

let registered = false;

// 注册个性化子页面文案：合并到对应 locale 的 messages（深合并）。
// 在 App.tsx 启动时调用一次，幂等。
export const registerPersonalizationLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', personalizationZhCN);
  localeRegistry.extend('en-US', personalizationEnUS);
  registered = true;
};
