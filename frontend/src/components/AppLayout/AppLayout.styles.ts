import type { SxProps, Theme } from '@mui/material';

export const appLayoutStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: fp.bg.content,
    },
    main: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.content,
      overflow: 'hidden',
    },
  };
};
