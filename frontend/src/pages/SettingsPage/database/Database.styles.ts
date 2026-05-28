import type { SxProps, Theme } from '@mui/material';

// 数据库子页面专属样式：路径展示卡片 + 操作按钮 + 状态文案 + 图表 + 表行。
export const databaseStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    // 信息卡片：单列垂直堆叠
    infoCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      p: 2.5,
      borderRadius: 1.5,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      flexWrap: 'wrap',
    },
    infoLabel: {
      fontSize: 12,
      color: fp.text.muted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      fontWeight: 600,
      flexShrink: 0,
      width: 120,
    },
    infoValue: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: 13,
      color: fp.text.primary,
      flex: 1,
      minWidth: 0,
      wordBreak: 'break-all',
    },
    badge: {
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 600,
      px: 1,
      py: 0.25,
      borderRadius: 0.75,
      ml: 1,
    },
    badgeCustom: {
      backgroundColor: fp.bg.active,
      color: fp.accent,
    },
    badgeDefault: {
      backgroundColor: fp.bg.elevated,
      color: fp.text.secondary,
    },
    badgeEstimated: {
      backgroundColor: fp.bg.elevated,
      color: fp.text.muted,
    },

    // 操作行
    actions: {
      display: 'flex',
      gap: 1,
      flexWrap: 'wrap',
      mt: 1,
    },
    actionPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      fontSize: 13,
      fontWeight: 600,
      px: 2,
      py: 1,
      borderRadius: 1,
      border: `1px solid ${fp.accent}`,
      backgroundColor: fp.accent,
      color: '#fff',
      cursor: 'pointer',
      '&:hover': { backgroundColor: fp.accentHover },
      '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
    },
    actionSecondary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      fontSize: 13,
      px: 2,
      py: 1,
      borderRadius: 1,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
      color: fp.text.primary,
      cursor: 'pointer',
      '&:hover': { backgroundColor: fp.bg.hover },
      '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
    },

    // 状态提示
    status: {
      fontSize: 12,
      color: fp.text.muted,
      lineHeight: 1.5,
    },
    statusError: {
      fontSize: 12,
      color: fp.status.danger,
      lineHeight: 1.5,
    },

    // —— 图表区 ——
    chartsRow: {
      display: 'grid',
      // 桌面双图并列；窄屏自动堆叠
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 2,
    },
    chartCard: {
      p: 2,
      borderRadius: 1.5,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
      minHeight: 280,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
    chartTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: fp.text.primary,
    },
    chartHint: {
      fontSize: 11,
      color: fp.text.muted,
    },
    chartHost: {
      flex: 1,
      minHeight: 220,
    },
    emptyChart: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: fp.text.muted,
      fontSize: 12,
    },

    // —— 表清单（行式） ——
    tableList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
    tableRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 1.5,
      borderRadius: 1.5,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
    },
    tableRowMain: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
    },
    tableRowLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      fontSize: 14,
      fontWeight: 600,
      color: fp.text.primary,
    },
    tableRowMeta: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: 12,
      color: fp.text.muted,
    },
    tableRowAction: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      flexShrink: 0,
      fontSize: 12,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
      color: fp.status.danger,
      cursor: 'pointer',
      '&:hover': { backgroundColor: fp.bg.hover },
      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    },
    tableRowActionDisabled: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      flexShrink: 0,
      fontSize: 12,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.elevated,
      color: fp.text.muted,
      cursor: 'not-allowed',
    },
  };
};
