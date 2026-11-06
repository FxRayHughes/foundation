import { TitleBar } from '@/components/TitleBar';
import { Navigation, NavigationDrawerButton } from '@/components/Navigation';
import { RouterOutlet } from '@/router';
import { useAppLayout } from './useAppLayout';
import classes from './AppLayout.module.css';

export interface AppLayoutProps {
  // 可选：覆盖标题栏标题；不传则 TitleBar 使用 i18n 默认值（app.title）
  title?: string;
}

// 软件基座外壳：CSS Grid，由当前布局预设（设置 → 布局）决定导航形态与位置。
//  默认（classic）：
//  ┌─────────────── TitleBar ───────────────┐
//  │ Rail │  RouterOutlet (当前页面)         │
//  └──────┴──────────────────────────────────┘
//  其余预设见 src/layouts/presets.ts（展开侧栏 / 顶部导航 / 融合标题栏 / 右侧栏 / 底部 Dock / 悬浮 Dock / 浮动卡片 / 专注）。
// AppLayout 不接收 children —— 主内容由 RouterOutlet 从路由表渲染。
export const AppLayout = ({ title }: AppLayoutProps) => {
  const { preset, dockSide } = useAppLayout();
  const { variant, placement } = preset.nav;

  const navigation = variant !== 'none' ? <Navigation variant={variant} placement={placement} /> : null;
  const inGrid = placement === 'left' || placement === 'right' || placement === 'top' || placement === 'bottom' || placement === 'float';

  return (
    <div
      className={classes.root}
      data-layout={preset.id}
      data-placement={placement}
      data-frame={preset.frame}
      data-dock-side={placement === 'float' ? dockSide : undefined}
    >
      <div className={classes.title}>
        <TitleBar
          {...(title !== undefined ? { title } : {})}
          leading={placement === 'drawer' ? <NavigationDrawerButton /> : undefined}
          center={placement === 'titlebar' ? navigation : undefined}
        />
      </div>
      {inGrid && navigation && <div className={classes.nav}>{navigation}</div>}
      <main className={classes.main}>
        <RouterOutlet />
      </main>
    </div>
  );
};
