import { localeRegistry } from '@/i18n';
import { blankWindowZhCN } from './zh-CN';
import { blankWindowEnUS } from './en-US';

let registered = false;

export const registerBlankWindowLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', blankWindowZhCN);
  localeRegistry.extend('en-US', blankWindowEnUS);
  registered = true;
};
