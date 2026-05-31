import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/material/styles';

export const systrayPanelStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.base,
      overflow: 'hidden',
      borderRadius: 2,
    },
    header: {
      px: 2,
      py: 1.5,
      borderBottom: `1px solid ${fp.divider}`,
    },
    appName: {
      fontSize: 13,
      fontWeight: 600,
      color: fp.text.primary,
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      borderTop: `1px solid ${fp.divider}`,
      p: 1,
    },
  };
};
