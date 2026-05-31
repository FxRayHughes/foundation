import { localeRegistry } from '@/i18n';
import { systrayZhCN } from './zh-CN';
import { systrayEnUS } from './en-US';

let registered = false;

export const registerSystrayLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', systrayZhCN);
  localeRegistry.extend('en-US', systrayEnUS);
  registered = true;
};
