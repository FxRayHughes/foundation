import { localeRegistry } from '@/i18n';
import { messageWindowZhCN } from './zh-CN';
import { messageWindowEnUS } from './en-US';

let registered = false;

export const registerMessageWindowLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', messageWindowZhCN);
  localeRegistry.extend('en-US', messageWindowEnUS);
  registered = true;
};
