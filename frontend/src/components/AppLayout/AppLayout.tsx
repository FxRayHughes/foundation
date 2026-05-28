import { Box, useTheme } from '@mui/material';
import { TitleBar } from '@/components/TitleBar';
import { Sidebar } from '@/components/Sidebar';
import { RouterOutlet } from '@/router';
import { appLayoutStyles } from './AppLayout.styles';

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
  const theme = useTheme();
  const styles = appLayoutStyles(theme);

  return (
    <>
      <TitleBar {...(title !== undefined ? { title } : {})} />
      <Box sx={styles.root}>
        <Sidebar />
        <Box component="main" sx={styles.main}>
          <RouterOutlet />
        </Box>
      </Box>
    </>
  );
};
