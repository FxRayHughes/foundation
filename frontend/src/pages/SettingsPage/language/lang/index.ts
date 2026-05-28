import { localeRegistry } from '@/i18n';
import { languageZhCN } from './zh-CN';
import { languageEnUS } from './en-US';

let registered = false;

export const registerLanguageLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', languageZhCN);
  localeRegistry.extend('en-US', languageEnUS);
  registered = true;
};
