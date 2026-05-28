// I18n 模块对外出口。
//  - registerFoundationLocales()：注册内置 locale 公用文案。App 启动时调用一次（幂等）。
//  - 页面级语言包请通过 localeRegistry.extend(code, partial) 注入，
//    约定写在 src/pages/<Name>/lang/index.ts 的 register<Name>Locales() 函数里。
import { localeRegistry } from './registry';
import { zhCN } from './locales/zh-CN';
import { enUS } from './locales/en-US';

let registered = false;

export const registerFoundationLocales = (): void => {
  if (registered) return;
  // 默认中文。换默认语言：另注册一个并指定 default: true，不要改这里
  localeRegistry.register(zhCN, { default: true });
  localeRegistry.register(enUS);
  registered = true;
};

export { localeRegistry } from './registry';
export { I18nProvider, useI18n, useT } from './I18nProvider';
export type {
  I18nContextValue,
  Locale,
  LocaleCode,
  Messages,
  TranslationVars,
} from './types';
export { zhCN } from './locales/zh-CN';
export { enUS } from './locales/en-US';
