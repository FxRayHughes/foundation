import type { NavItem } from './useNavigation';

// View 侧的路由文案解析：优先 t(labelKey)，否则回落到 label 字面量
export const navLabel = (t: (key: string) => string, item: NavItem): string =>
  item.labelKey ? t(item.labelKey) : item.label;
