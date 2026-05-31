import type { SxProps, Theme } from '@mui/material';

export const blankWindowStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.base,
    },
    content: {
      flex: 1,
      overflow: 'auto',
      p: 2,
    },
  };
};
