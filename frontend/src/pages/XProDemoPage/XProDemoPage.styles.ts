import type { SxProps, Theme } from '@mui/material';

export const xProDemoStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
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
      px: 4,
      py: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    sectionTitle: {
      color: fp.text.primary,
      fontWeight: 600,
      fontSize: 18,
    },
    card: {
      p: 3,
      backgroundColor: fp.bg.surface,
      borderRadius: 2,
      border: `1px solid ${fp.divider}`,
    },
    chartRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: 3,
    },
    gridContainer: {
      height: 400,
      width: '100%',
    },
  };
};
