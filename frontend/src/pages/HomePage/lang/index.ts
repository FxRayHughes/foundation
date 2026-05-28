import { localeRegistry } from '@/i18n';
import { homePageZhCN } from './zh-CN';
import { homePageEnUS } from './en-US';

// 把 HomePage 的语言包合并到已注册的全局 locale。
// App 启动时调用一次（幂等内部依赖：extend 在 code 不存在时静默返回，
// 即便顺序错乱也不会挂应用，但请确保 registerFoundationLocales() 在前）。
let registered = false;

export const registerHomePageLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', homePageZhCN);
  localeRegistry.extend('en-US', homePageEnUS);
  registered = true;
};
