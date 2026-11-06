import { TitleBar } from '@/components/TitleBar';
import { Sidebar } from '@/components/Sidebar';
import { RouterOutlet } from '@/router';
import { useAppLayout } from './useAppLayout';
import classes from './AppLayout.module.css';

export interface AppLayoutProps {
  // 可选：覆盖标题栏标题；不传则 TitleBar 使用 i18n 默认值（app.title）
  title?: string;
}

// 软件基座外壳：
//  ┌─────────────── TitleBar ───────────────┐
//  │ Sidebar │  RouterOutlet (当前页面)     │
//  └─────────┴──────────────────────────────┘
// AppLayout 不接收 children —— 主内容由 RouterOutlet 从路由表渲染。
export const AppLayout = ({ title }: AppLayoutProps) => {
  useAppLayout();
  return (
    <>
      <TitleBar {...(title !== undefined ? { title } : {})} />
      <div className={classes.root}>
        <Sidebar />
        <main className={classes.main}>
          <RouterOutlet />
        </main>
      </div>
    </>
  );
};
