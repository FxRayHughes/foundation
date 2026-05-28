import { localeRegistry } from '@/i18n';
import { databaseZhCN } from './zh-CN';
import { databaseEnUS } from './en-US';

let registered = false;

export const registerDatabaseLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', databaseZhCN);
  localeRegistry.extend('en-US', databaseEnUS);
  registered = true;
};
