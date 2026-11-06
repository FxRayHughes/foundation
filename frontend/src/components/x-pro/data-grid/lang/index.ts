import { localeRegistry } from '@/i18n';
import { dataGridZhCN } from './zh-CN';
import { dataGridEnUS } from './en-US';

// DataGrid 是组件而非页面：没有固定的 App 启动注册点，
// 所以模块加载时自行注册；若此时公用 locale 尚未注册，则订阅 registry，等其出现后补注册。
// 幂等：重复调用无副作用。
let registered = false;
let unsubscribe: (() => void) | null = null;

const tryRegister = (): boolean => {
  if (registered) return true;
  if (!localeRegistry.has('zh-CN') || !localeRegistry.has('en-US')) return false;
  registered = true;
  localeRegistry.extend('zh-CN', dataGridZhCN);
  localeRegistry.extend('en-US', dataGridEnUS);
  return true;
};

export const registerDataGridLocales = (): void => {
  if (tryRegister() || unsubscribe) return;
  unsubscribe = localeRegistry.subscribe(() => {
    if (tryRegister()) {
      unsubscribe?.();
      unsubscribe = null;
    }
  });
};
