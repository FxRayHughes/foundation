import type { SxProps, Theme } from '@mui/material';

export const messageWindowStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      gap: 2,
    },
    message: {
      fontSize: 14,
      color: fp.text.primary,
      textAlign: 'center',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      px: 2,
      pb: 2,
    },
    button: {
      borderRadius: 1.5,
      textTransform: 'none',
    },
  };
};
