import type { SxProps, Theme } from '@mui/material';

// 个性化子页面的"内部样式"。
// 注意：这里只包含本子页面专属的样式 ——
//   - 主题卡片网格
//   - 偏好开关行
//   - 自定义主题调色板
// 共享的 section 标题 / 卡片 hint 等基础样式取自 SettingsPage.styles.ts，
// 子页面通过 props 接收 sharedStyles 后混用。
export const personalizationStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    // —— 主题：卡片网格 ——
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 1.5,
    },
    card: {
      p: 2,
      borderRadius: 1.5,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'border-color 120ms ease, background-color 120ms ease',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      '&:hover': { backgroundColor: fp.bg.hover },
    },
    cardActive: {
      p: 2,
      borderRadius: 1.5,
      border: `1px solid ${fp.accent}`,
      backgroundColor: fp.bg.active,
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    },
    cardLabel: {
      fontSize: 14,
      fontWeight: 600,
      color: fp.text.primary,
    },
    cardDesc: {
      fontSize: 12,
      color: fp.text.muted,
      lineHeight: 1.5,
    },
    currentLine: {
      fontSize: 12,
      color: fp.text.muted,
    },

    // —— 开关：单行 ——
    switchRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 3,
      px: 2.5,
      py: 2,
      borderRadius: 1.5,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
    },
    switchTexts: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
      minWidth: 0,
    },
    switchLabel: {
      fontSize: 14,
      fontWeight: 600,
      color: fp.text.primary,
    },
    switchDesc: {
      fontSize: 12,
      color: fp.text.muted,
      lineHeight: 1.5,
    },

    // —— 自定义主题：颜色字段网格 ——
    paletteToolbar: {
      display: 'flex',
      gap: 1,
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    paletteToolbarBtn: {
      fontSize: 12,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
      color: fp.text.primary,
      cursor: 'pointer',
      '&:hover': { backgroundColor: fp.bg.hover },
    },
    paletteGroupTitle: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: fp.text.muted,
      mt: 1,
      mb: 0.5,
    },
    paletteGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 1.25,
    },
    paletteRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1.25,
      borderRadius: 1.5,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
    },
    paletteSwatch: {
      position: 'relative',
      width: 36,
      height: 36,
      borderRadius: 1,
      border: `1px solid ${fp.divider}`,
      flexShrink: 0,
      overflow: 'hidden',
      cursor: 'pointer',
    },
    paletteSwatchInput: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer',
      border: 0,
      padding: 0,
    },
    paletteRowTexts: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
    },
    paletteFieldLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: fp.text.primary,
    },
    paletteFieldDesc: {
      fontSize: 11,
      color: fp.text.muted,
      lineHeight: 1.4,
    },
    paletteFieldValue: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: 12,
      color: fp.text.secondary,
      width: 110,
      px: 1,
      py: 0.5,
      borderRadius: 1,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.elevated,
      outline: 'none',
      '&:focus': { borderColor: fp.accent },
    },
  };
};
