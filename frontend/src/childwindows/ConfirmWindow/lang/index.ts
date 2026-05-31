import { localeRegistry } from '@/i18n';
import { confirmWindowZhCN } from './zh-CN';
import { confirmWindowEnUS } from './en-US';

let registered = false;

export const registerConfirmWindowLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', confirmWindowZhCN);
  localeRegistry.extend('en-US', confirmWindowEnUS);
  registered = true;
};
