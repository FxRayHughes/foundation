import { localeRegistry } from '@/i18n';
import { xProChartsZhCN } from './zh-CN';
import { xProChartsEnUS } from './en-US';

// x-pro Charts 是组件而非页面：没有固定的 App 启动注册点，
// 所以图表模块加载时自行注册（见 ../shared/useChartsT.ts）；App 启动时也应显式调用一次。
// 若此时公用 locale 尚未注册，则订阅 registry，等其出现后补注册。
// 幂等：重复调用无副作用。（与 components/x-pro/data-grid/lang 同一模式）
let registered = false;
let unsubscribe: (() => void) | null = null;

const tryRegister = (): boolean => {
  if (registered) return true;
  if (!localeRegistry.has('zh-CN') || !localeRegistry.has('en-US')) return false;
  registered = true;
  localeRegistry.extend('zh-CN', xProChartsZhCN);
  localeRegistry.extend('en-US', xProChartsEnUS);
  return true;
};

export const registerXProChartsLocales = (): void => {
  if (tryRegister() || unsubscribe) return;
  unsubscribe = localeRegistry.subscribe(() => {
    if (tryRegister()) {
      unsubscribe?.();
      unsubscribe = null;
    }
  });
};
