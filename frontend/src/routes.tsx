import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import { lazy } from 'react';
import { HomePage } from '@/pages/HomePage/HomePage';
import { HomePageSkeleton } from '@/pages/HomePage/HomePage.skeleton';
import { SettingsPageSkeleton } from '@/pages/SettingsPage/SettingsPage.skeleton';
import { XProDemoPageSkeleton } from '@/pages/XProDemoPage/XProDemoPage.skeleton';
import type { RouteDefinition } from '@/router';

// SettingsPage 走 React.lazy：调色板编辑器较重，首屏不进入 main bundle。
// HomePage 保持同步加载（首页常用 + 体积小，lazy 反而引入一次额外的闪烁）。
//
// 注意：lazy import 必须从具体子文件 (SettingsPage.tsx) 导入，
// 不要从 index.ts 走 —— 否则与 App.tsx 静态 import 同 index 合并到主 chunk。
const SettingsPage = lazy(async () => {
  const mod = await import('@/pages/SettingsPage/SettingsPage');
  return { default: mod.SettingsPage };
});

const XProDemoPage = lazy(async () => {
  const mod = await import('@/pages/XProDemoPage/XProDemoPage');
  return { default: mod.XProDemoPage };
});

// 路由表是唯一事实源：
// - 新增页面：在这里追加一项即可，Sidebar 会自动渲染对应导航按钮
// - id 必须唯一；slot 决定 Sidebar 把它渲染到顶部还是底部
// - 想要不出现在 Sidebar 但仍可 navigate(id) 进入的页面，设 slot: 'hidden'
// - keepAlive 默认 false（离开即卸载）；若想保留输入 / 滚动 / 局部 state，设 true
// - fallback：lazy 组件加载期间的占位（推荐传该页面的骨架屏组件）
// - labelKey：i18n 路径（约定 'route.<id>'），渲染时 t(labelKey) 翻译；
//   label 是兜底字面量（未配置 labelKey 或翻译失败时使用）
export const routes: RouteDefinition[] = [
  {
    id: 'home',
    labelKey: 'route.home',
    label: 'Home',
    icon: HomeRoundedIcon,
    element: <HomePage />,
    fallback: <HomePageSkeleton />,
    slot: 'primary',
    keepAlive: true,
  },
  {
    id: 'x-pro-demo',
    labelKey: 'route.xProDemo',
    label: 'X-Pro Demo',
    icon: WidgetsRoundedIcon,
    element: <XProDemoPage />,
    fallback: <XProDemoPageSkeleton />,
    slot: 'primary',
  },
  {
    id: 'settings',
    labelKey: 'route.settings',
    label: 'Settings',
    icon: SettingsRoundedIcon,
    element: <SettingsPage />,
    fallback: <SettingsPageSkeleton />,
    slot: 'footer',
  },
];
