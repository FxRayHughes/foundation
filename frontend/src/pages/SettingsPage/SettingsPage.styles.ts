import type { SxProps, Theme } from '@mui/material';

// 设置页两列布局（最外侧的 Sidebar 菜单按钮不算）：
//  ┌─────────────┬─────────────────────────────┐
//  │  选项列表    │        详细配置             │
//  │ (220px 固定) │       (flex 占满)           │
//  └─────────────┴─────────────────────────────┘
//
// 这里只放"框架样式"：
//   - root / list / detail 容器
//   - 共享的 section 卡片标题（子页面内部分组用 sectionTitle / sectionHint / section）
//
// 子页面专属样式（卡片网格 / 开关行 / 调色板等）请在 SettingsPage/<name>/<Name>.styles.ts 里维护。
export const settingsPageStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: fp.bg.content,
      overflow: 'hidden',
    },

    // —— 左列：选项列表 ——
    list: {
      width: 220,
      flexShrink: 0,
      borderRight: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.sidebar,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    listHeader: {
      px: 2.5,
      pt: 3,
      pb: 1.5,
    },
    listEyebrow: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: fp.text.muted,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: fp.text.primary,
      mt: 0.5,
    },
    listItems: {
      px: 1,
      py: 0.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    },
    listItem: {
      position: 'relative',
      width: '100%',
      px: 2,
      py: 1.25,
      borderRadius: 1.5,
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      // ButtonBase 默认 align-items: center —— column 布局下会让 label / desc
      // 在交叉轴居中。显式声明 flex-start 才是真正的左对齐。
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: 0.25,
      color: fp.text.secondary,
      backgroundColor: 'transparent',
      transition: 'background-color 160ms cubic-bezier(0.4, 0, 0.2, 1), color 160ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: fp.bg.hover,
        color: fp.text.primary,
      },
    },
    listItemActive: {
      position: 'relative',
      width: '100%',
      px: 2,
      py: 1.25,
      borderRadius: 1.5,
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: 0.25,
      color: fp.accent,
      backgroundColor: fp.bg.active,
      transition: 'background-color 160ms cubic-bezier(0.4, 0, 0.2, 1), color 160ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: fp.bg.active,
        color: fp.accent,
      },
    },
    listItemIndicator: {
      position: 'absolute',
      left: -8,
      top: 10,
      bottom: 10,
      width: 3,
      borderRadius: '0 2px 2px 0',
      backgroundColor: fp.accent,
    },
    listItemLabel: {
      fontSize: 14,
      fontWeight: 600,
      color: 'inherit',
    },
    listItemDesc: {
      fontSize: 12,
      color: fp.text.muted,
      lineHeight: 1.4,
    },

    // —— 右列：详细配置 ——
    detail: {
      flex: 1,
      minWidth: 0,
      overflowY: 'auto',
      px: 6,
      py: 5,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    detailHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
    },
    detailEyebrow: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: fp.text.muted,
    },
    detailTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: fp.text.primary,
      lineHeight: 1.2,
      m: 0,
    },
    detailDesc: {
      fontSize: 14,
      color: fp.text.secondary,
      lineHeight: 1.55,
      maxWidth: 640,
    },

    // —— 子页面共享：section 容器 + 标题（被各 Subpage View 复用） ——
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      maxWidth: 720,
    },
    sectionHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: fp.text.primary,
    },
    sectionHint: {
      fontSize: 12,
      color: fp.text.muted,
      lineHeight: 1.55,
    },
  };
};
