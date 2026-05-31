import type { SxProps, Theme } from '@mui/material';

// TitleBar 样式工厂：从 theme.palette.foundation 取色，避免硬编码。
// 控制按钮遵循 Windows Fluent caption button 规范（46×32、0 圆角、透明），
// 标题文字偏轻量，不抢主内容焦点。
export const titleBarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      height: 36,
      minHeight: 36,
      display: 'flex',
      alignItems: 'center',
      pl: 1.5,
      pr: 0,
      backgroundColor: fp.bg.base,
      borderBottom: `1px solid ${fp.divider}`,
      flexShrink: 0,
      color: fp.text.muted,
    },
    macSpacer: {
      width: 72,
      flexShrink: 0,
    },
    title: {
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: 0.2,
      color: fp.text.secondary,
    },
    spacer: {
      flex: 1,
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      pl: 1,
    },
    // Windows Fluent caption buttons：46×32、0 圆角、透明
    // 不再继承全局 IconButton 默认样式（borderRadius / 默认底色）
    controlBtn: {
      width: 46,
      height: 36,
      borderRadius: 0,
      fontSize: 14,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: fp.text.secondary,
      '&:hover': {
        backgroundColor: fp.bg.hover,
        color: fp.text.primary,
      },
    },
    closeBtn: {
      width: 46,
      height: 36,
      borderRadius: 0,
      fontSize: 14,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: fp.text.secondary,
      '&:hover': {
        backgroundColor: fp.status.danger,
        color: '#fff',
      },
    },
  };
};
