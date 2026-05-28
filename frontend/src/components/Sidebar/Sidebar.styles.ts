import type { SxProps, Theme } from '@mui/material';

// Sidebar 扁平化设计：
//  - 未选中：完全透明，仅图标颜色（text.secondary），不喧宾夺主
//  - hover：bg.hover 半透明覆盖 + text.primary，让"可点"信号清晰
//  - 选中：bg.active 半透明底色 + accent 图标 + 左侧 3px accent indicator bar
//  - 圆角 12px（设计语言：柔和方形圆角）
//  - 颜色全部从 theme.palette.foundation.* 取，三主题自动适配
export const sidebarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      width: 64,
      flexShrink: 0,
      backgroundColor: fp.bg.sidebar,
      borderRight: `1px solid ${fp.divider}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 1.5, // 12px
      gap: 1, // 8px
    },
    brand: {
      width: 40,
      height: 40,
      borderRadius: 2.5, // 10px
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: fp.bg.elevated,
      color: fp.accent,
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: 0.5,
      mb: 0.5,
    },
    brandDivider: {
      width: 40,
      height: '1px',
      backgroundColor: fp.divider,
      mb: 0.5,
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1, // 8px
      py: 0.5,
    },
    spacer: {
      flex: 1,
    },
    itemWrap: {
      position: 'relative',
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicator: {
      position: 'absolute',
      left: -8, // 顶到 sidebar 左侧 8px gutter 的边
      top: 12,
      bottom: 12,
      width: 3,
      borderRadius: '0 2px 2px 0',
      backgroundColor: fp.accent,
    },
    item: {
      width: 48,
      height: 48,
      borderRadius: 1.5, // 12px
      color: fp.text.secondary,
      backgroundColor: 'transparent',
      transition: 'background-color 160ms cubic-bezier(0.4, 0, 0.2, 1), color 160ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: fp.bg.hover,
        color: fp.text.primary,
      },
    },
    itemActive: {
      width: 48,
      height: 48,
      borderRadius: 1.5,
      color: fp.accent,
      backgroundColor: fp.bg.active,
      transition: 'background-color 160ms cubic-bezier(0.4, 0, 0.2, 1), color 160ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: fp.bg.active,
        color: fp.accent,
      },
    },
  };
};
