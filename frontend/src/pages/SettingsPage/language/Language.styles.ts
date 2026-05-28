import type { SxProps, Theme } from '@mui/material';

// 语言子页面专属样式：复用主题卡片网格的视觉语言。
export const languageStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
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
  };
};
