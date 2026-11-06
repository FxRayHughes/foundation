// 兼容出口：64px 图标栏已并入 Navigation 包（components/Navigation/NavRail）。
// 保留 `@/components/Sidebar` 以免旧文档 / 旧 import 失效；新代码请用 `@/components/Navigation`。
export { NavRail as Sidebar } from '@/components/Navigation';
export type { NavRailProps as SidebarProps } from '@/components/Navigation';
