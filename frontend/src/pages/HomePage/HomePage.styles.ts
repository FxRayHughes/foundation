import type { SxProps, Theme } from '@mui/material';

export const homePageStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.content,
      overflow: 'hidden',
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      px: 6,
      py: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      alignItems: 'stretch',
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: fp.text.muted,
    },
    hero: {
      fontSize: 32,
      fontWeight: 700,
      color: fp.text.primary,
      lineHeight: 1.2,
      m: 0,
    },
    subtitle: {
      color: fp.text.secondary,
      fontSize: 15,
      lineHeight: 1.6,
    },
    card: {
      width: '100%',
      p: 3,
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: fp.text.secondary,
    },
    result: {
      color: fp.text.primary,
      fontSize: 14,
    },
    form: {
      display: 'flex',
      gap: 1.5,
      alignItems: 'center',
      width: '100%',
    },
    input: {
      flex: 1,
    },
    error: {
      color: fp.status.danger,
      fontSize: 13,
    },
    footer: {
      pt: 1,
      color: fp.text.muted,
      fontSize: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    },
    code: {
      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      backgroundColor: fp.bg.elevated,
      border: `1px solid ${fp.divider}`,
      borderRadius: 1,
      px: 0.75,
      py: 0.25,
      fontSize: 12,
    },
  };
};
