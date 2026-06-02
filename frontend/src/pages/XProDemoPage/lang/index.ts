import { localeRegistry } from '@/i18n';
import { xProDemoPageZhCN } from './zh-CN';
import { xProDemoPageEnUS } from './en-US';

// 把 XProDemoPage 的语言包合并到已注册的全局 locale。
// App 启动时调用一次（必须在 registerFoundationLocales() 之后）。
let registered = false;

export const registerXProDemoPageLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', xProDemoPageZhCN);
  localeRegistry.extend('en-US', xProDemoPageEnUS);
  registered = true;
};
