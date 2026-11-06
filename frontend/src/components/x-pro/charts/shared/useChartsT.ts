import { useI18n } from '@/i18n';
import { registerXProChartsLocales } from '../lang';

// 模块求值即注册 x-pro 图表语言包（幂等），保证深路径 import 单个图表时文案也存在。
registerXProChartsLocales();

/**
 * 图表内部取文案 / 当前语言代码的统一入口。
 * 文案在 `xproCharts.*` 命名空间（components/x-pro/charts/lang）。
 */
export function useChartsI18n() {
  const { t, current } = useI18n();
  return { t, locale: current.code };
}
